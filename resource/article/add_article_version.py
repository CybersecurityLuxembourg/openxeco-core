from flask_restful import Resource
from flask import request
from flask_jwt_extended import jwt_required
from decorator.log_request import log_request
from decorator.verify_payload import verify_payload
from decorator.verify_admin_access import verify_admin_access
from decorator.catch_exception import catch_exception


class AddArticleVersion(Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @verify_payload([
        {'field': 'name', 'type': str},
        {'field': 'article_id', 'type': int}
    ])
    @jwt_required
    @verify_admin_access
    @catch_exception
    def post(self):
        input_data = request.get_json()

        if len(self.db.get(self.db.tables["Article"], {"id": input_data["article_id"]})) == 0:
            return "", "422 the provided article does not exist"

        self.db.insert(input_data, self.db.tables["ArticleVersion"])

        return "", "200 "
