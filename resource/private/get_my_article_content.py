from flask_apispec import MethodResource
from flask_apispec import doc
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_restful import Resource

from db.db import DB
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from utils.serializer import Serializer


class GetMyArticleContent(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @doc(tags=['private'],
         description='Get the content of an article editable by the user authenticated by the token',
         responses={
             "200": {},
         })
    @jwt_required
    @catch_exception
    def get(self, id_):

        articles = self.db.get(self.db.tables["Article"], {"id": id_})

        if len(articles) < 1:
            return "", "422 Article ID not found"

        article_companies = self.db.get(self.db.tables["ArticleCompanyTag"], {"article": id_})

        if len(article_companies) < 1:
            return "", "422 Article has no company assigned"

        if len(article_companies) > 1:
            return "", "422 Article has too much companies assigned"

        assignments = self.db.get(self.db.tables["UserCompanyAssignment"], {
            "user_id": get_jwt_identity(),
            "company_id": article_companies[0].company
        })

        if len(assignments) < 1:
            return "", "422 User not assign to the company"

        article_versions = self.db.get(self.db.tables["ArticleVersion"], {"is_main": True, "article_id": id_})

        if len(article_versions) < 1:
            return "", "422 Article main version not found. Please contact the administrator"

        data = self.db.get(self.db.tables["ArticleBox"], {"article_version_id": article_versions[0].id})
        data = Serializer.serialize(data, self.db.tables["ArticleBox"])

        return data, "200 "
