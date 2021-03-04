from flask_restful import Resource
from flask import request
from flask_jwt_extended import jwt_required
from decorator.log_request import log_request
from decorator.verify_payload import verify_payload
from decorator.verify_admin_access import verify_admin_access
from decorator.catch_exception import catch_exception
import re


class AddArticle(Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @catch_exception
    @verify_payload([
        {'field': 'title', 'type': str}
    ])
    @jwt_required
    @verify_admin_access
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
