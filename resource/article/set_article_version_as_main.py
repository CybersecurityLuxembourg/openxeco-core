from flask_restful import Resource
from flask_apispec import MethodResource
from flask import request
from flask_jwt_extended import jwt_required
from decorator.verify_payload import verify_payload
from decorator.verify_admin_access import verify_admin_access
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request


class SetArticleVersionAsMain(MethodResource, Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @verify_payload([
        {'field': 'id', 'type': int}
    ])
    @jwt_required
    @verify_admin_access
    @catch_exception
    def post(self):
        input_data = request.get_json()

        article_version = self.db.get(self.db.tables["ArticleVersion"], {"id": input_data["id"]})

        if len(article_version) < 1:
            return "", "422 The provided article version ID does not exist"

        other_versions = self.db.get(self.db.tables["ArticleVersion"], {"article_id": article_version[0].article_id})

        for v in other_versions:
            v.is_main = False

        article_version[0].is_main = True

        self.db.merge(other_versions, self.db.tables["ArticleVersion"], commit=False)
        self.db.merge(article_version, self.db.tables["ArticleVersion"])

        return "", "200 "
