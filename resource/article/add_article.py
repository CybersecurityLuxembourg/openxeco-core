from flask_restful import Resource
from flask import request
from flask_jwt_extended import jwt_required
from utils.log_request import log_request
from utils.verify_payload import verify_payload
import re


class AddArticle(Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @verify_payload(format=[
        {'field': 'title', 'type': str}
    ])
    @jwt_required
    def post(self):
        input_data = request.get_json()

        article = self.db.insert({
            "title": input_data["title"],
            "handle": re.sub(r'[^a-z1-9-]', '', input_data["title"].lower().replace(" ", "-"))[:100]
        }, self.db.tables["Article"])
        self.db.insert({
            "article_id": article.id,
            "name": "Version 0",
            "is_main": True
        }, self.db.tables["ArticleVersion"])

        return "", "200 "
