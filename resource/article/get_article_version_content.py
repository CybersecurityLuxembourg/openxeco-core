from flask_restful import Resource
from flask_jwt_extended import jwt_required
from db.db import DB
from utils.serializer import Serializer
from utils.catch_exception import catch_exception
from utils.log_request import log_request
from exception.object_not_found import ObjectNotFound


class GetArticleVersionContent(Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @catch_exception
    @jwt_required
    def get(self, id):

        data = self.db.get(self.db.tables["ArticleVersion"], {"id": id})

        if len(data) < 1:
            raise ObjectNotFound

        data = self.db.get(self.db.tables["ArticleBox"], {"article_version_id": id})
        data = Serializer.serialize(data, self.db.tables["ArticleBox"])

        return data, "200 "
