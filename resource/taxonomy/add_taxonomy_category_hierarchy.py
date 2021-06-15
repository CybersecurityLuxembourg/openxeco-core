from flask_restful import Resource
from flask_apispec import MethodResource
from flask import request
from flask_jwt_extended import jwt_required
from sqlalchemy.exc import IntegrityError
from decorator.verify_payload import verify_payload
from decorator.verify_admin_access import verify_admin_access
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request


class AddTaxonomyCategoryHierarchy(MethodResource, Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @verify_payload([
        {'field': 'parent_category', 'type': str},
        {'field': 'child_category', 'type': str}
    ])
    @jwt_required
    @verify_admin_access
    @catch_exception
    def post(self):
        input_data = request.get_json()

        if input_data["parent_category"] == input_data["child_category"]:
            return "", "422 The provided categories cannot be the same one"

        if len(self.db.get(
                self.db.tables["TaxonomyCategory"],
                {"name": [input_data["parent_category"], input_data["child_category"]]}
        )) < 2:
            return "", "422 One of the provided category does not exist"

        try:
            self.db.insert(
                {"parent_category": input_data["parent_category"], "child_category": input_data["child_category"]},
                self.db.tables["TaxonomyCategoryHierarchy"]
            )
        except IntegrityError as e:
            self.db.session.rollback()
            if "Duplicate entry" in str(e):
                return "", "422 This relation is already existing"
            raise e

        return "", "200 "
