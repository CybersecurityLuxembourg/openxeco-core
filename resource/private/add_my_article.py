import re

from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_restful import Resource
from webargs import fields

from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access


class AddMyArticle(MethodResource, Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @doc(tags=['private'],
         description='Add an article determined by its title and related to an assigned company',
         responses={
             "200": {},
         })
    @use_kwargs({
        'title': fields.Str(),
        'company': fields.Int(),
    })
    @jwt_required
    @catch_exception
    def post(self, **kwargs):

        # Check if the functionality is allowed

        settings = self.db.get(self.db.tables["Setting"])
        allowance_setting = [s for s in settings if s.property == "ALLOW_ECOSYSTEM_TO_EDIT_ARTICLE"]

        if len(allowance_setting) < 1 or allowance_setting[0].value != "TRUE":
            return "", "422 The article edition functionality is not activated"

        # Check the company

        companies = self.db.get(self.db.tables["Company"], {"id": kwargs["company"]})

        if len(companies) < 1:
            return "", "422 Company ID not found"

        # Check the right of the user

        assignments = self.db.get(self.db.tables["UserCompanyAssignment"], {
            "user_id": get_jwt_identity(),
            "company_id": kwargs["company"]
        })

        if len(assignments) < 1:
            return "", "422 User not assign to the company"

        # Insert rows

        article = self.db.insert(
            {
                "title": kwargs["title"],
                "handle": re.sub(r'[^a-z1-9-]', '', kwargs["title"].lower().replace(" ", "-"))[:100],
                "is_created_by_admin": False,
            },
            self.db.tables["Article"]
        )

        self.db.insert(
            {
                "article_id": article.id,
                "name": "Version 0 [Initiated by the company]",
                "is_main": True
            },
            self.db.tables["ArticleVersion"],
        )

        self.db.insert(
            {
                "article": article.id,
                "company": kwargs["company"],
            },
            self.db.tables["ArticleCompanyTag"]
        )

        return "", "200 "
