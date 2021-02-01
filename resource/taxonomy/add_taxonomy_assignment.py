from flask_restful import Resource
from flask import request
from flask_jwt_extended import jwt_required
from utils.verify_payload import verify_payload
from sqlalchemy.exc import IntegrityError
from exception.object_already_existing import ObjectAlreadyExisting
from exception.object_not_found import ObjectNotFound
from exception.cannot_assign_value_from_parent_category import CannotAssignValueFromParentCategory
from utils.log_request import log_request


class AddTaxonomyAssignment(Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @verify_payload(format=[
        {'field': 'company', 'type': int},
        {'field': 'value', 'type': int}
    ])
    @jwt_required
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

        try:
            self.db.insert(row, self.db.tables["TaxonomyAssignment"])
        except IntegrityError as e:
            self.db.session.rollback()
            if "Duplicate entry" in str(e):
                raise ObjectAlreadyExisting
            else:
                raise e

        return "", "200 "
