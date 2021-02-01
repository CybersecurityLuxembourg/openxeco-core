from flask_restful import Resource
from flask import request
from flask_jwt_extended import jwt_required
from utils.verify_payload import verify_payload
from exception.object_not_found import ObjectNotFound
from utils.log_request import log_request


class DeleteTaxonomyTag(Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @verify_payload(format=[
        {'field': 'article', 'type': int},
        {'field': 'taxonomy_value', 'type': int}
    ])
    @jwt_required
    def post(self):
        input_data = request.get_json()

        row = {
            "article": input_data["article"],
            "taxonomy_value": input_data["taxonomy_value"]
        }

        companies = self.db.get(self.db.tables["ArticleTaxonomyTag"], row)

        if len(companies) == 0:
            raise ObjectNotFound
        else:
            self.db.delete(self.db.tables["ArticleTaxonomyTag"], row)

        return "", "200 "
