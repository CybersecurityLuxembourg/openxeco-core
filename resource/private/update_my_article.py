from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_restful import Resource
from webargs import fields

from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from exception.object_not_found import ObjectNotFound
from exception.user_not_assign_to_company import UserNotAssignedToCompany
from exception.deactivated_article_edition import DeactivatedArticleEdition
from exception.article_type_not_allowed import ArticleTypeNotAllowed


class UpdateMyArticle(MethodResource, Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @doc(tags=['private'],
         description='Update an article editable by the user authenticated by the token',
         responses={
             "200": {},
             "403.1": {"description": "The article edition is deactivated"},
             "403.2": {"description": "The article type is not allowed"},
             "422.1": {"description": "Object not found : Article"},
             "422.2": {"description": "Article has no company assigned"},
             "422.3": {"description": "Article has too much companies assigned"},
             "422.4": {"description": "The user is not assign to the company"},
             "422.5": {"description": "The article handle is already used"},
             "422.6": {"description": "The article status can't be set to 'PUBLIC'"},
             "422.7": {"description": "The article status can't be set to 'UNDER REVIEW'"},
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

        settings = self.db.get(self.db.tables["Setting"])
        allowance_setting = [s for s in settings if s.property == "ALLOW_ECOSYSTEM_TO_EDIT_ARTICLE"]
        review_setting = [s for s in settings if s.property == "DEACTIVATE_REVIEW_ON_ECOSYSTEM_ARTICLE"]

        # Check if the functionality is allowed

        if len(allowance_setting) < 1 or allowance_setting[0].value != "TRUE":
            raise DeactivatedArticleEdition()

        # Check existence of objects

        articles = self.db.get(self.db.tables["Article"], {"id": kwargs["id"]})

        if len(articles) < 1:
            raise ObjectNotFound("Article")

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
            raise UserNotAssignedToCompany()

        # Valid values of properties

        if "type" in kwargs:
            type_setting = [s for s in settings if s.property == "AUTHORIZED_ARTICLE_TYPES_FOR_ECOSYSTEM"]

            if len(type_setting) < 1 or kwargs["type"] not in type_setting[0].value.split(","):
                raise ArticleTypeNotAllowed()

        if "handle" in kwargs:
            articles_with_same_handle = self.db.get(self.db.tables["Article"], {"handle": kwargs["handle"]})

            if len(articles_with_same_handle) > 0:
                return "", "422 The article handle is already used"

        if "status" in kwargs:
            if (len(review_setting) == 0 or review_setting[0].value != "TRUE") and kwargs["status"] == "PUBLIC":
                return "", "422 The article status can't be set to 'PUBLIC'"

            if len(review_setting) > 0 and review_setting[0].value == "TRUE" and kwargs["status"] == "UNDER REVIEW":
                return "", "422 The article status can't be set to 'UNDER REVIEW'"

        # Modify article

        if len(review_setting) == 0 or review_setting[0].value != "TRUE":
            if articles[0].status == "PUBLIC":
                kwargs["status"] = "UNDER REVIEW"

        self.db.merge(kwargs, self.db.tables["Article"])

        return "", "200 "
