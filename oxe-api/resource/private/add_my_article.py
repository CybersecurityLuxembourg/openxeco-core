import re

from flask import render_template
from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_jwt_extended import fresh_jwt_required, get_jwt_identity
from flask_restful import Resource
from webargs import fields
from sqlalchemy.exc import IntegrityError

from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from exception.object_not_found import ObjectNotFound
from exception.user_not_assign_to_entity import UserNotAssignedToEntity
from exception.deactivated_article_edition import DeactivatedArticleEdition
from utils.mail import send_email
from utils.env import get_admin_portal_url


class AddMyArticle(MethodResource, Resource):

    db = None

    def __init__(self, db, mail):
        self.db = db
        self.mail = mail

    @log_request
    @doc(tags=['private'],
         description='Add an article determined by its title and related to an assigned entity',
         responses={
             "200": {},
             "403": {"description": "The article edition is deactivated"},
             "422.1": {"description": "Object not found : Entity"},
             "422.2": {"description": "The user is not assign to the entity"},
             "422.3": {"description": "This article seems to already exist"},
         })
    @use_kwargs({
        'title': fields.Str(),
        'entity_id': fields.Int(),
    })
    @fresh_jwt_required
    @catch_exception
    def post(self, **kwargs):

        # Check if the functionality is allowed

        settings = self.db.get(self.db.tables["Setting"])
        allowance_setting = [s for s in settings if s.property == "ALLOW_ECOSYSTEM_TO_EDIT_ARTICLE"]

        if len(allowance_setting) < 1 or allowance_setting[0].value != "TRUE":
            raise DeactivatedArticleEdition()

        # Check the entity

        entities = self.db.get(self.db.tables["Entity"], {"id": kwargs["entity_id"]})

        if len(entities) < 1:
            raise ObjectNotFound("Entity")

        # Check the right of the user

        assignments = self.db.get(self.db.tables["UserEntityAssignment"], {
            "user_id": get_jwt_identity(),
            "entity_id": kwargs["entity_id"]
        })

        if len(assignments) < 1:
            raise UserNotAssignedToEntity()

        # Insert rows

        try:
            article = self.db.insert(
                {
                    "title": kwargs["title"],
                    "handle": re.sub(r'[^a-z1-9-]', '', kwargs["title"].lower().replace(" ", "-"))[:100],
                    "is_created_by_admin": False,
                },
                self.db.tables["Article"]
            )
        except IntegrityError as e:
            self.db.session.rollback()
            if "Duplicate entry" in str(e):
                return "", "422 This article seems to already exist"
            raise e

        self.db.insert(
            {
                "article_id": article.id,
                "name": "Version 0 [Initiated by the entity]",
                "is_main": True
            },
            self.db.tables["ArticleVersion"],
        )

        self.db.insert(
            {
                "article_id": article.id,
                "entity_id": kwargs["entity_id"],
            },
            self.db.tables["ArticleEntityTag"]
        )

        # Get email addresses to send notification

        addresses = self.db.session \
            .query(self.db.tables["User"]) \
            .with_entities(self.db.tables["User"].email) \
            .filter(self.db.tables["User"].is_admin.is_(True)) \
            .filter(self.db.tables["User"].is_active.is_(True)) \
            .filter(self.db.tables["User"].accept_request_notification.is_(True)) \
            .all()

        addresses = [a[0] for a in addresses]

        # Send new community article notification email

        if len(addresses) > 0:
            pj_settings = self.db.get(self.db.tables["Setting"], {"property": "PROJECT_NAME"})
            project_name = pj_settings[0].value if len(pj_settings) > 0 else ""

            send_email(self.mail,
                       subject=f"[{project_name}] New article from the community",
                       recipients=addresses,
                       html_body=render_template(
                           'new_community_article_notification.html',
                           url=get_admin_portal_url() + "/task?tab=request",
                           project_name=project_name)
                       )

        return "", "200 "
