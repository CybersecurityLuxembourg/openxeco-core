from flask_restful import Resource
from flask import request
from flask_jwt_extended import jwt_required
from decorator.verify_payload import verify_payload
from decorator.verify_admin_access import verify_admin_access
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request


class AddContact(Resource):

    def __init__(self, db):
        self.db = db

    @log_request
    @verify_payload([
        {'field': 'company_id', 'type': int},
        {'field': 'type', 'type': str},
        {'field': 'representative', 'type': str, 'nullable': True},
        {'field': 'name', 'type': str, 'nullable': True},
        {'field': 'value', 'type': str, 'nullable': True},
    ])
    @jwt_required
    @verify_admin_access
    @catch_exception
    def post(self):
        input_data = request.get_json()

        # Checking company

        company = self.db.get(self.db.tables["Company"], {"id": input_data["company_id"]})

        if len(company) == 0:
            return "", "422 Provided company not existing"

        # Insert

        self.db.insert(input_data, self.db.tables["CompanyContact"])

        return "", "200 "
