from flask import request
from flask_jwt_extended import jwt_required
from flask_restful import Resource
from sqlalchemy.exc import IntegrityError
from decorator.verify_admin_access import verify_admin_access
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_payload import verify_payload


class AddTaxonomyCategory(Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @verify_payload([
        {'field': 'category', 'type': str},
    ])
    @jwt_required
    @verify_admin_access
    @catch_exception
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
                return "", "422 This category is already existing"
            raise e

        return "", "200 "
