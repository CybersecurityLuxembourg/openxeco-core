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
             "422.1": {"description": "Article ID not found"},
             "422.2": {"description": "Article has no entity assigned"},
             "422.3": {"description": "Article has too much entities assigned"},
             "422.4": {"description": "User not assign to the entity"},
             "422.5": {"description": "Article main version not found. Please contact the administrator"},
             "422.6": {"description": "Too much main version found. Please contact the administrator"},
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

        # Check the article version

        article_versions = self.db.get(self.db.tables["ArticleVersion"], {"is_main": True, "article_id": id_})

        if len(article_versions) < 1:
            return "", "422 Article main version not found. Please contact the administrator"

        if len(article_versions) > 1:
            return "", "422 Too much main version found. Please contact the administrator"

        # Fetch and return the data

        data = self.db.get(self.db.tables["ArticleBox"], {"article_version_id": article_versions[0].id})
        data = Serializer.serialize(data, self.db.tables["ArticleBox"])

        return data, "200 "
