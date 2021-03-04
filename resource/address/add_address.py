from flask_restful import Resource
from flask import request
from flask_jwt_extended import jwt_required
from decorator.verify_payload import verify_payload
from decorator.verify_admin_access import verify_admin_access
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request


class AddAddress(Resource):

    def __init__(self, db):
        self.db = db

    @log_request
    @catch_exception
    @verify_payload([
        {'field': 'company_id', 'type': int},
        {'field': 'address_1', 'type': str},
        {'field': 'address_2', 'type': str, 'nullable': True},
        {'field': 'number', 'type': str, 'nullable': True},
        {'field': 'postal_code', 'type': str, 'nullable': True},
        {'field': 'city', 'type': str},
        {'field': 'administrative_area', 'type': str, 'nullable': True},
        {'field': 'country', 'type': str},
        {'field': 'latitude', 'type': float, 'nullable': True},
        {'field': 'longitude', 'type': float, 'nullable': True},
    ])
    @jwt_required
    @verify_admin_access
    def post(self):
        input_data = request.get_json()

        # Checking company

        company = self.db.get(self.db.tables["Company"], {"id": input_data["company_id"]})

        if len(company) == 0:
            return "", "422 Provided company not existing"

        # Insert

        self.db.insert(input_data, self.db.tables["Company_Address"])

        return "", "200 "
