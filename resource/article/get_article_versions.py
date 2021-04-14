from flask_restful import Resource
from flask_jwt_extended import jwt_required
from db.db import DB
from decorator.verify_admin_access import verify_admin_access
from utils.serializer import Serializer
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from exception.object_not_found import ObjectNotFound


class GetArticleVersions(Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @jwt_required
    @verify_admin_access
    @catch_exception
    def get(self, id_):

        data = self.db.get(self.db.tables["Article"], {"id": id_})

        if len(data) < 1:
            raise ObjectNotFound

        data = self.db.get(self.db.tables["ArticleVersion"], {"article_id": id_})
        data = Serializer.serialize(data, self.db.tables["ArticleVersion"])

        return data, "200 "
