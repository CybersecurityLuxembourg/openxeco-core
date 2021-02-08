from flask_restful import Resource
from flask import request
from flask_jwt_extended import jwt_required
from decorator.log_request import log_request
from decorator.verify_payload import verify_payload
from decorator.verify_admin_access import verify_admin_access
from decorator.catch_exception import catch_exception
from utils.serializer import Serializer
from datetime import datetime


class CopyArticleVersion(Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @catch_exception
    @verify_payload(format=[
        {'field': 'name', 'type': str, 'optional': True},
        {'field': 'article_version_id', 'type': int}
    ])
    @jwt_required
    @verify_admin_access
    def post(self):
        input_data = request.get_json()

        article_version = self.db.get(self.db.tables["ArticleVersion"], {"id": input_data["article_version_id"]})

        if len(article_version) < 1:
            return "", "422 The provided article version ID does not exist"
        else:
            article_version = article_version[0]

        copied_version = Serializer.serialize(article_version, self.db.tables["ArticleVersion"])
        del copied_version["id"]
        copied_version["name"] = input_data["name"] if "name" in input_data else \
            f"{copied_version['name']} - Copy {datetime.now().strftime('%Y-%m-%d %H:%M')}"
        copied_version["is_main"] = False
        copied_version = self.db.insert(copied_version, self.db.tables["ArticleVersion"], commit=False)

        content = self.db.get(self.db.tables["ArticleBox"], {"article_version_id": article_version.id})

        for c in content:
            c = Serializer.serialize(c, self.db.tables["ArticleBox"])
            c["article_version_id"] = copied_version.id
            del c["id"]
            self.db.insert(c, self.db.tables["ArticleBox"], commit=False)

        self.db.session.commit()

        return "", "200 "
