from flask_restful import Resource
from flask import request
from flask_jwt_extended import jwt_required
from decorator.verify_payload import verify_payload
from decorator.verify_admin_access import verify_admin_access
from decorator.catch_exception import catch_exception
from exception.object_not_found import ObjectNotFound
from decorator.log_request import log_request


class DeleteTaxonomyAssignment(Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @catch_exception
    @verify_payload(format=[
        {'field': 'company', 'type': int},
        {'field': 'value', 'type': int}
    ])
    @jwt_required
    @verify_admin_access
    def post(self):
        input_data = request.get_json()

        row = {
            "company": input_data["company"],
            "taxonomy_value": input_data["value"]
        }

        companies = self.db.get(self.db.tables["TaxonomyAssignment"], row)

        if len(companies) == 0:
            raise ObjectNotFound
        else:
            self.db.delete(self.db.tables["TaxonomyAssignment"], row)

        return "", "200 "
