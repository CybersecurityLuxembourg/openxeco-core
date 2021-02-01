from flask_restful import Resource
from flask import request
from flask_jwt_extended import jwt_required
from utils.log_request import log_request
from utils.verify_payload import verify_payload


class AddTaxonomyTag(Resource):

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

        if len(self.db.get(self.db.tables["Article"], {"id": input_data["article"]})) == 0:
            return "", "422 the provided article does not exist"

        if len(self.db.get(self.db.tables["TaxonomyValue"], {"id": input_data["taxonomy_value"]})) == 0:
            return "", "422 the provided taxonomy value does not exist"

        self.db.insert(input_data, self.db.tables["ArticleTaxonomyTag"])

        return "", "200 "
