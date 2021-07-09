from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_restful import Resource
from webargs import fields

from decorator.catch_exception import catch_exception
from decorator.log_request import log_request


class UpdateMyArticleContent(MethodResource, Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @doc(tags=['private'],
         description='Update content of an article',
         responses={
             "200": {},
         })
    @use_kwargs({
        'article_id': fields.Int(),
        'content': fields.List(fields.Dict()),
    })
    @jwt_required
    @catch_exception
    def post(self, **kwargs):

        # Check if the functionnality is allowed

        settings = self.db.get(self.db.tables["Setting"])
        allowance_setting = [s for s in settings if s.property == "ALLOW_ECOSYSTEM_TO_EDIT_ARTICLE"]

        if len(allowance_setting) < 1 or allowance_setting[0].value != "TRUE":
            return "", "422 The article edition functionality is not allowed"

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

        # Check the article version

        pass

        # Modify article content

        self.db.delete(
            self.db.tables["ArticleBox"], {"article_version_id": kwargs["article_version_id"]},
            commit=False
        )

        for i, c in enumerate(kwargs["content"]):
            c = {k: c[k] for k in ["type", "content"]}
            c["position"] = i + 1
            c["article_version_id"] = kwargs["article_version_id"]

            if c["type"] not in self.db.tables["ArticleBox"].__table__.columns["type"].type.enums:
                self.db.session.rollback()
                return "", f"422 Wrong content type found: '{c['type']}'"

            self.db.insert(c, self.db.tables["ArticleBox"], commit=False)

        self.db.session.commit()

        return "", "200 "
