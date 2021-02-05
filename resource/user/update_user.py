from flask_restful import Resource
from flask import request
from flask_jwt_extended import jwt_required
from utils.verify_payload import verify_payload
from utils.log_request import log_request
from exception.cannot_modify_this_attribute import CannotModifyThisAttribute


class UpdateUser(Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @verify_payload(format=[
        {'field': 'id', 'type': int}
    ])
    @jwt_required
    def post(self):
        input_data = request.get_json()

        if "password" in input_data:
            raise CannotModifyThisAttribute("password")
        if "email" in input_data:
            raise CannotModifyThisAttribute("mail")

        self.db.merge(input_data, self.db.tables["User"])

        return "", "200 "
