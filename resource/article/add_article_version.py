from flask_restful import Resource
from flask import request
from flask_jwt_extended import jwt_required
from utils.log_request import log_request
from utils.verify_payload import verify_payload


class AddArticleVersion(Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @verify_payload(format=[
        {'field': 'name', 'type': str},
        {'field': 'article_id', 'type': int}
    ])
    @jwt_required
    def post(self):
        input_data = request.get_json()

        if len(self.db.get(self.db.tables["Article"], {"id": input_data["article_id"]})) == 0:
            return "", "422 the provided article does not exist"

        self.db.insert(input_data, self.db.tables["ArticleVersion"])

        return "", "200 "
