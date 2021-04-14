from flask_restful import Resource
from flask import request
from flask_jwt_extended import jwt_required
from decorator.verify_payload import verify_payload
from decorator.verify_admin_access import verify_admin_access
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from exception.cannot_modify_this_attribute import CannotModifyThisAttribute


class UpdateUser(Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @verify_payload([
        {'field': 'id', 'type': int}
    ])
    @jwt_required
    @verify_admin_access
    @catch_exception
    def post(self):
        input_data = request.get_json()

        if "password" in input_data:
            raise CannotModifyThisAttribute("password")
        if "email" in input_data:
            raise CannotModifyThisAttribute("email")

        self.db.merge(input_data, self.db.tables["User"])

        return "", "200 "
