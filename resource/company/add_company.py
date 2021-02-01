from flask_restful import Resource
from flask import request
from flask_jwt_extended import jwt_required
from utils.log_request import log_request
from utils.verify_payload import verify_payload


class AddCompany(Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @verify_payload(format=[
        {'field': 'name', 'type': str}
    ])
    @jwt_required
    def post(self):
        input_data = request.get_json()

        self.db.insert(input_data, self.db.tables["Company"])

        return "", "200 "
