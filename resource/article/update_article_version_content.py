from flask_restful import Resource
from flask import request
from flask_jwt_extended import jwt_required
from decorator.verify_payload import verify_payload
from decorator.verify_admin_access import verify_admin_access
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request


class UpdateArticleVersionContent(Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @catch_exception
    @verify_payload(format=[
        {'field': 'article_version_id', 'type': int},
        {'field': 'content', 'type': list},
    ])
    @jwt_required
    @verify_admin_access
    def post(self):
        input_data = request.get_json()

        if len(self.db.get(self.db.tables["ArticleVersion"], {"id": input_data["article_version_id"]})) < 1:
            return "", "422 The provided article version ID does not exist"

        self.db.delete(
            self.db.tables["ArticleBox"], {"article_version_id": input_data["article_version_id"]},
            commit=False
        )

        for i, c in enumerate(input_data["content"]):
            c = {k: c[k] for k in ["type", "content"]}
            c["position"] = i + 1
            c["article_version_id"] = input_data["article_version_id"]

            if c["type"] not in self.db.tables["ArticleBox"].__table__.columns["type"].type.enums:
                self.db.session.rollback()
                return "", f"422 Wrong content type found: '{c['type']}'"

            self.db.insert(c, self.db.tables["ArticleBox"], commit=False)

        self.db.session.commit()

        return "", "200 "
