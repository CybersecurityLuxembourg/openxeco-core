from flask_restful import Resource
from flask import request
from flask_jwt_extended import jwt_required
from sqlalchemy.exc import IntegrityError
from utils.verify_payload import verify_payload
from exception.object_already_existing import ObjectAlreadyExisting
from utils.log_request import log_request


class AddTaxonomyCategoryHierarchy(Resource):

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
                raise ObjectAlreadyExisting
            else:
                raise e

        return "", "200 "
