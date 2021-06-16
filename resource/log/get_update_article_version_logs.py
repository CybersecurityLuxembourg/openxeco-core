from flask_restful import Resource
from flask_apispec import MethodResource
from flask_jwt_extended import jwt_required
from flask_apispec import doc, marshal_with
from db.db import DB
from decorator.verify_admin_access import verify_admin_access
from utils.serializer import Serializer
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from exception.object_not_found import ObjectNotFound


class GetUpdateArticleVersionLogs(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @doc(tags=['log'], description='Get logs of content updates from an article')
    @marshal_with(None, code=200)
    @marshal_with(None, code=422, description="422 Object not found")
    @jwt_required
    @verify_admin_access
    @catch_exception
    def get(self, id_):

        data = self.db.get(self.db.tables["ArticleVersion"], {"id": id_})

        if len(data) < 1:
            raise ObjectNotFound

        data = self.db.session.query(self.db.tables["Log"]) \
            .filter(self.db.tables["Log"].request == "/article/update_article_version_content") \
            .filter(self.db.tables["Log"].params.like(f'%"article_version_id": {id_},%') |
                    self.db.tables["Log"].params.like(f'%"article_version_id": {id_}}}%')) \
            .filter(self.db.tables["Log"].status_code == 200) \
            .all()

        data = Serializer.serialize(data, self.db.tables["Log"])

        return data, "200 "
