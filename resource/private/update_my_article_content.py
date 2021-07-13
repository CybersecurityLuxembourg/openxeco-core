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


class UpdateMyArticleContent(MethodResource, Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @doc(tags=['private'],
         description='Update content of an article',
         responses={
             "200": {},
             "403.1": {"description": "The article edition is deactivated"},
             "403.2": {"description": "The article type is not allowed"},
             "422.1": {"description": "Object not found : Article"},
             "422.2": {"description": "Article has no company assigned"},
             "422.3": {"description": "Article has too much companies assigned"},
             "422.4": {"description": "The user is not assign to the company"},
             "422.5": {"description": "Article main version not found. Please contact the administrator"},
             "422.6": {"description": "Too much main version found. Please contact the administrator"},
             "422.7": {"description": "Wrong content type found: 'TYPE'"},
         })
    @use_kwargs({
        'article': fields.Int(),
        'content': fields.List(fields.Dict()),
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

        articles = self.db.get(self.db.tables["Article"], {"id": kwargs["article"]})

        if len(articles) < 1:
            raise ObjectNotFound("Article")

        article_companies = self.db.get(self.db.tables["ArticleCompanyTag"], {"article": kwargs["article"]})

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

        # Check the article version

        article_versions = self.db.get(
            self.db.tables["ArticleVersion"],
            {"is_main": True, "article_id": kwargs["article"]}
        )

        if len(article_versions) < 1:
            return "", "422 Article main version not found. Please contact the administrator"

        if len(article_versions) > 1:
            return "", "422 Too much main version found. Please contact the administrator"

        # Modify article content

        self.db.delete(
            self.db.tables["ArticleBox"], {"article_version_id": article_versions[0].id},
            commit=False
        )

        for i, c in enumerate(kwargs["content"]):
            c = {k: c[k] for k in ["type", "content"]}
            c["position"] = i + 1
            c["article_version_id"] = article_versions[0].id

            if c["type"] not in self.db.tables["ArticleBox"].__table__.columns["type"].type.enums:
                self.db.session.rollback()
                return "", f"422 Wrong content type found: '{c['type']}'"

            self.db.insert(c, self.db.tables["ArticleBox"], commit=False)

        if len(review_setting) == 0 or review_setting[0].value != "TRUE":
            if articles[0].status == "PUBLIC":
                self.db.merge({
                    "id": articles[0].id,
                    "status": "UNDER REVIEW"
                }, self.db.tables["Article"], commit=False)

        self.db.session.commit()

        return "", "200 "
