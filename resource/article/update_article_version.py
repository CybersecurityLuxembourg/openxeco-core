from flask_restful import Resource
from flask import request
from flask_jwt_extended import jwt_required
from utils.verify_payload import verify_payload
from utils.log_request import log_request


class UpdateArticleVersion(Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @verify_payload(format=[
        {'field': 'id', 'type': int}
    ])
    @jwt_required
    def post(self):
        input_data = request.get_json()

        self.db.merge(input_data, self.db.tables["ArticleVersion"])

        return "", "200 "
