from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_restful import Resource
from webargs import fields

from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from exception.object_not_found import ObjectNotFound
from exception.user_not_assign_to_entity import UserNotAssignedToEntity
from exception.deactivated_article_edition import DeactivatedArticleEdition


class DeleteMyArticle(MethodResource, Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @doc(tags=['private'],
         description='Delete an article editable by the user authenticated by the token',
         responses={
             "200": {},
             "403": {"description": "The article edition is deactivated"},
             "422.1": {"description": "Object not found : Article"},
             "422.2": {"description": "Article has no entity assigned"},
             "422.3": {"description": "Article has too much entities assigned"},
             "422.4": {"description": "The user is not assign to the entity"},
         })
    @use_kwargs({
        'id': fields.Int(),
    })
    @jwt_required
    @catch_exception
    def post(self, **kwargs):

        # Check if the functionality is allowed

        settings = self.db.get(self.db.tables["Setting"])
        allowance_setting = [s for s in settings if s.property == "ALLOW_ECOSYSTEM_TO_EDIT_ARTICLE"]

        if len(allowance_setting) < 1 or allowance_setting[0].value != "TRUE":
            raise DeactivatedArticleEdition()

        # Check existence of objects

        articles = self.db.get(self.db.tables["Article"], {"id": kwargs["id"]})

        if len(articles) < 1:
            raise ObjectNotFound("Article")

        article_entities = self.db.get(self.db.tables["ArticleEntityTag"], {"article": kwargs["id"]})

        if len(article_entities) < 1:
            return "", "422 Article has no entity assigned"

        if len(article_entities) > 1:
            return "", "422 Article has too much entities assigned"

        # Check right of the user

        assignments = self.db.get(self.db.tables["UserEntityAssignment"], {
            "user_id": get_jwt_identity(),
            "entity_id": article_entities[0].entity
        })

        if len(assignments) < 1:
            raise UserNotAssignedToEntity()

        # Modify article

        self.db.delete_by_id(kwargs["id"], self.db.tables["Article"])

        return "", "200 "
