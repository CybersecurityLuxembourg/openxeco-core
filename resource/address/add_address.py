from flask_restful import Resource
from flask import request
from flask_jwt_extended import jwt_required
from utils.verify_payload import verify_payload
from utils.log_request import log_request


class AddAddress(Resource):

    def __init__(self, db):
        self.db = db

    @log_request
    @verify_payload(format=[
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
    def post(self):
        input_data = request.get_json()

        # Checking company

        company = self.db.get(self.db.tables["Company"], {"id": input_data["company_id"]})

        if len(company) == 0:
            return "", "422 Provided company not existing"

        # Insert

        self.db.insert(input_data, self.db.tables["Company_Address"])

        return "", "200 "
