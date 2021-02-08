from flask_restful import Resource
from flask import request
from flask_jwt_extended import jwt_required
from sqlalchemy.exc import IntegrityError
from decorator.verify_payload import verify_payload
from decorator.verify_admin_access import verify_admin_access
from decorator.catch_exception import catch_exception
from exception.object_already_existing import ObjectAlreadyExisting
from decorator.log_request import log_request


class AddTaxonomyCategory(Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @catch_exception
    @verify_payload(format=[
        {'field': 'category', 'type': str},
    ])
    @jwt_required
    def post(self):
        input_data = request.get_json()

        try:
            self.db.insert(
                {"name": input_data["category"]},
                self.db.tables["TaxonomyCategory"]
            )
        except IntegrityError as e:
            self.db.session.rollback()
            if "Duplicate entry" in str(e):
                raise ObjectAlreadyExisting
            else:
                raise e

        return "", "200 "
