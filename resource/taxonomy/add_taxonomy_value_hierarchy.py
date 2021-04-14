from flask_restful import Resource
from flask import request
from flask_jwt_extended import jwt_required
from decorator.verify_payload import verify_payload
from decorator.verify_admin_access import verify_admin_access
from decorator.catch_exception import catch_exception
from sqlalchemy.exc import IntegrityError
from exception.object_already_existing import ObjectAlreadyExisting
from decorator.log_request import log_request


class AddTaxonomyValueHierarchy(Resource):

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

        if input_data["parent_value"] == input_data["child_value"]:
            return "", "422 The provided values cannot be the same one"

        # Verification of the values

        pv = self.db.get(self.db.tables["TaxonomyValue"], {"id": input_data["parent_value"]})
        cv = self.db.get(self.db.tables["TaxonomyValue"], {"id": input_data["child_value"]})

        if len(pv) == 0:
            return "", "422 Provided parent value not existing"
        if len(cv) == 0:
            return "", "422 Provided child value not existing"

        # Verification that the hierarchy is correct

        hierarchy = self.db.get(
            self.db.tables["TaxonomyCategoryHierarchy"],
            {"parent_category": pv[0].category, "child_category": cv[0].category}
        )

        if len(hierarchy) == 0:
            return "", "422 Hierarchy between the categories of the values does not exist"

        # Add the row

        row = {
            "parent_value": input_data["parent_value"],
            "child_value": input_data["child_value"]
        }

        try:
            self.db.insert(row, self.db.tables["TaxonomyValueHierarchy"])
        except IntegrityError as e:
            self.db.session.rollback()
            if "Duplicate entry" in str(e):
                raise ObjectAlreadyExisting
            raise e

        return "", "200 "
