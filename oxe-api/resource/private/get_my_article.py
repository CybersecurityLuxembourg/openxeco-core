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
             "422.1": {"description": "Article ID not found"},
             "422.2": {"description": "Article has no entity assigned"},
             "422.3": {"description": "Article has too much entities assigned"},
             "422.4": {"description": "User not assign to the entity"},
         })
    @jwt_required
    @catch_exception
    def get(self, id_):

        # Check existence of objects

        articles = self.db.get(self.db.tables["Article"], {"id": id_})

        if len(articles) < 1:
            return "", "422 Article ID not found"

        article_entities = self.db.get(self.db.tables["ArticleEntityTag"], {"article_id": id_})

        if len(article_entities) < 1:
            return "", "422 Article has no entity assigned"

        if len(article_entities) > 1:
            return "", "422 Article has too much entities assigned"

        # Check right of the user

        assignments = self.db.get(self.db.tables["UserEntityAssignment"], {
            "user_id": get_jwt_identity(),
            "entity_id": article_entities[0].entity_id
        })

        if len(assignments) < 1:
            return "", "422 User not assign to the entity"

        # Fetch and return the data

        data = Serializer.serialize(articles[0], self.db.tables["Article"])

        return data, "200 "
