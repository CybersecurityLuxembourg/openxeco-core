from flask_restful import Resource
from flask import request
from flask_jwt_extended import jwt_required
from exception.object_not_found import ObjectNotFound
from utils.verify_payload import verify_payload
from utils.log_request import log_request


class DeleteTaxonomyCategoryHierarchy(Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @verify_payload(format=[
        {'field': 'parent_category', 'type': str},
        {'field': 'child_category', 'type': str}
    ])
    @jwt_required
    def post(self):
        input_data = request.get_json()

        row = {
            "parent_category": input_data["parent_category"],
            "child_category": input_data["child_category"]
        }

        values = self.db.get(self.db.tables["TaxonomyCategoryHierarchy"],  row)

        if len(values) == 0:
            raise ObjectNotFound
        else:
            self.db.delete(self.db.tables["TaxonomyCategoryHierarchy"], row)

        return "", "200 "
