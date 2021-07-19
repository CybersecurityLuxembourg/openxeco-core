from flask_apispec import MethodResource
from flask_apispec import doc
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_restful import Resource

from db.db import DB
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from utils.serializer import Serializer


class GetMyArticle(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @doc(tags=['private'],
         description='Get the information of an article editable by the user authenticated by the token',
         responses={
             "200": {},
         })
    @jwt_required
    @catch_exception
    def get(self, id_):

        # Check existence of objects

        articles = self.db.get(self.db.tables["Article"], {"id": id_})

        if len(articles) < 1:
            return "", "422 Article ID not found"

        article_companies = self.db.get(self.db.tables["ArticleCompanyTag"], {"article": id_})

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

        if len(articles) < 1:
            return "", "422 Article ID not found"

        # Fetch and return the data

        data = Serializer.serialize(articles[0], self.db.tables["Article"])

        return data, "200 "
