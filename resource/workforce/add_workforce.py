from flask_restful import Resource
from flask import request
from flask_jwt_extended import jwt_required
from decorator.verify_payload import verify_payload
from decorator.verify_admin_access import verify_admin_access
from decorator.catch_exception import catch_exception
from utils.re import has_date_format
from decorator.log_request import log_request


class AddWorkforce(Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @catch_exception
    @verify_payload([
        {'field': 'company', 'type': int},
        {'field': 'workforce', 'type': int},
        {'field': 'date', 'type': str},
        {'field': 'is_estimated', 'type': bool},
        {'field': 'source', 'type': str}
    ])
    @jwt_required
    @verify_admin_access
    def post(self):
        input_data = request.get_json()

        # Checking date

        if not has_date_format(input_data["date"]):
            return "", "422 Provided date does not have the right format (expected: YYYY-mm-dd)"

        # Checking source

        source = self.db.get(self.db.tables["Source"], {"name": input_data["source"]})

        if len(source) == 0:
            return "", "422 Provided source not existing"

        # Checking company

        company = self.db.get(self.db.tables["Company"], {"id": input_data["company"]})

        if len(company) == 0:
            return "", "422 Provided company not existing"

        # Insert

        self.db.insert(input_data, self.db.tables["Workforce"])

        return "", "200 "
