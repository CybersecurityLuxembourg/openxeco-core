from flask_restful import Resource
from flask_apispec import MethodResource
from flask import request
from flask_jwt_extended import jwt_required
from decorator.verify_payload import verify_payload
from decorator.verify_admin_access import verify_admin_access
from decorator.catch_exception import catch_exception
from exception.object_not_found import ObjectNotFound
from decorator.log_request import log_request


class DeleteTaxonomyValueHierarchy(MethodResource, Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @verify_payload([
        {'field': 'parent_value', 'type': int},
        {'field': 'child_value', 'type': int}
    ])
    @jwt_required
    @verify_admin_access
    @catch_exception
    def post(self):
        input_data = request.get_json()

        row = {
            "parent_value": input_data["parent_value"],
            "child_value": input_data["child_value"]
        }

        values = self.db.get(self.db.tables["TaxonomyValueHierarchy"], row)

        if len(values) > 0:
            self.db.delete(self.db.tables["TaxonomyValueHierarchy"], row)
        else:
            raise ObjectNotFound

        return "", "200 "
