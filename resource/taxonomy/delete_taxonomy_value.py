from flask_restful import Resource
from flask import request
from flask_jwt_extended import jwt_required
from exception.object_not_found import ObjectNotFound
from utils.verify_payload import verify_payload
from utils.log_request import log_request


class DeleteTaxonomyValue(Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @verify_payload(format=[
        {'field': 'category', 'type': str},
        {'field': 'name', 'type': str}
    ])
    @jwt_required
    def post(self):
        input_data = request.get_json()

        values = self.db.get(
            self.db.tables["TaxonomyValue"],
            {"name": input_data["name"], "category": input_data["category"]}
        )

        if len(values) == 0:
            raise ObjectNotFound
        else:
            self.db.delete(
                self.db.tables["TaxonomyValue"],
                {"name": input_data["name"], "category": input_data["category"]}
            )

        return "", "200 "
