from flask_restful import Resource
from flask import request
from flask_jwt_extended import jwt_required
from utils.verify_payload import verify_payload
from exception.object_not_found import ObjectNotFound
from utils.log_request import log_request


class DeleteTaxonomyValueHierarchy(Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @verify_payload(format=[
        {'field': 'parent_value', 'type': int},
        {'field': 'child_value', 'type': int}
    ])
    @jwt_required
    def post(self):
        input_data = request.get_json()

        row = {
            "parent_value": input_data["parent_value"],
            "child_value": input_data["child_value"]
        }

        values = self.db.get(self.db.tables["TaxonomyValueHierarchy"], row)

        if len(values) == 0:
            raise ObjectNotFound
        else:
            self.db.delete(self.db.tables["TaxonomyValueHierarchy"], row)

        return "", "200 "
