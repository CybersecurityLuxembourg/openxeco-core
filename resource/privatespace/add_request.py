from flask_restful import Resource
from flask import request
from flask_jwt_extended import jwt_required, get_jwt_identity
from decorator.verify_payload import verify_payload
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request


class AddRequest(Resource):

    def __init__(self, db):
        self.db = db

    @log_request
    @catch_exception
    @verify_payload(format=[
        {'field': 'request', 'type': str},
    ])
    @jwt_required
    def post(self):
        input_data = request.get_json()

        user_request = {
            "user_id": int(get_jwt_identity()),
            "request": input_data["request"]
        }

        self.db.insert(user_request, self.db.tables["UserRequest"])

        return "", "200 "
