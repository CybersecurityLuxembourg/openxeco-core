from flask_restful import Resource
from flask_jwt_extended import jwt_required
from db.db import DB
from utils.serializer import Serializer
from utils.catch_exception import catch_exception
from utils.log_request import log_request
from exception.object_not_found import ObjectNotFound


class GetUpdateArticleVersionLogs(Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @catch_exception
    @jwt_required
    def get(self, id):

        data = self.db.get(self.db.tables["ArticleVersion"], {"id": id})

        if len(data) < 1:
            raise ObjectNotFound

        data = self.db.session.query(self.db.tables["Log"]) \
            .filter(self.db.tables["Log"].request == "/article/update_article_version_content") \
            .filter(self.db.tables["Log"].params.like(f'%"article_version_id": {id},%') |
                    self.db.tables["Log"].params.like(f'%"article_version_id": {id}}}%')) \
            .filter(self.db.tables["Log"].status_code == 200) \
            .all()

        data = Serializer.serialize(data, self.db.tables["Log"])

        return data, "200 "
