from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_restful import Resource
from webargs import fields

from decorator.catch_exception import catch_exception
from decorator.log_request import log_request


class UpdateMyArticle(MethodResource, Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @doc(tags=['private'],
         description='Update an article editable by the user authenticated by the token',
         responses={
             "200": {},
         })
    @use_kwargs({
        'id': fields.Int(),
        'handle': fields.Str(required=False, allow_none=True),
        'title': fields.Str(required=False, allow_none=True),
        'abstract': fields.Str(required=False, allow_none=True),
        'publication_date': fields.Str(required=False, allow_none=True),
        'start_date': fields.Str(required=False, allow_none=True),
        'end_date': fields.Str(required=False, allow_none=True),
        'status': fields.Str(required=False, allow_none=True),
        'type': fields.Str(required=False, allow_none=True),
        'external_reference': fields.Str(required=False, allow_none=True),
        'link': fields.Str(required=False, allow_none=True),
    })
    @jwt_required
    @catch_exception
    def post(self, **kwargs):

        # Check if the functionality is allowed

        settings = self.db.get(self.db.tables["Setting"])
        allowance_setting = [s for s in settings if s.property == "ALLOW_ECOSYSTEM_TO_EDIT_ARTICLE"]

        if len(allowance_setting) < 1 or allowance_setting[0].value != "TRUE":
            return "", "422 The article edition functionality is not activated"

        # Check existence of objects

        articles = self.db.get(self.db.tables["Article"], {"id": kwargs["id"]})

        if len(articles) < 1:
            return "", "422 Article ID not found"

        article_companies = self.db.get(self.db.tables["ArticleCompanyTag"], {"article": kwargs["id"]})

        if len(article_companies) < 1:
            return "", "422 Article has no company assigned"

        if len(article_companies) > 1:
            return "", "422 Article has too much companies assigned"

        # Check right of the user

        assignments = self.db.get(self.db.tables["UserCompanyAssignment"], {
            "user_id": get_jwt_identity(),
            "company_id": article_companies[0].company
        })

        if len(assignments) < 1:
            return "", "422 User not assign to the company"

        # Valid values of properties

        if "type" in kwargs:
            type_setting = [s for s in settings if s.property == "AUTHORIZED_ARTICLE_TYPES_FOR_ECOSYSTEM"]

            if len(type_setting) < 1 or kwargs["type"] not in type_setting[0].value.split(","):
                return "", "422 The article type is not allowed"

        if "handle" in kwargs:
            articles = self.db.get(self.db.tables["Article"], {"handle": kwargs["handle"]})

            if len(articles) > 0:
                return "", "422 The article handle is not available"

        # Modify article

        self.db.merge(kwargs, self.db.tables["Article"])

        return "", "200 "
