from flask_restful import Resource
from flask import request
from flask_jwt_extended import jwt_required
from decorator.verify_payload import verify_payload
from decorator.verify_admin_access import verify_admin_access
from decorator.catch_exception import catch_exception
from sqlalchemy.exc import IntegrityError
from exception.object_already_existing import ObjectAlreadyExisting
from exception.object_not_found import ObjectNotFound
from exception.cannot_assign_value_from_parent_category import CannotAssignValueFromParentCategory
from decorator.log_request import log_request


class AddTaxonomyAssignment(Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @verify_payload([
        {'field': 'company', 'type': int},
        {'field': 'value', 'type': int}
    ])
    @jwt_required
    @verify_admin_access
    @catch_exception
    def post(self):
        input_data = request.get_json()

        taxonomy_value = self.db.get(self.db.tables["TaxonomyValue"], {"id": input_data["value"]})

        if len(taxonomy_value) == 1:
            f = {"parent_category": taxonomy_value[0].category}
            ch = self.db.get(self.db.tables["TaxonomyCategoryHierarchy"], f)

            if len(ch) > 0:
                raise CannotAssignValueFromParentCategory
        else:
            raise ObjectNotFound

        row = {
            "company": input_data["company"],
            "taxonomy_value": input_data["value"]
        }

        if self.db.get_count(self.db.tables["TaxonomyAssignment"], row) > 0:
            return "", "422 This assignment is already existing"

        try:
            self.db.insert(row, self.db.tables["TaxonomyAssignment"])
        except IntegrityError as e:
            self.db.session.rollback()
            if "Duplicate entry" in str(e):
                return "422 This assignment is already existing"
            raise e

        return "", "200 "
