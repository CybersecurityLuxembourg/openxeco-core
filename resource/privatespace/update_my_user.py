from flask_restful import Resource
from flask import request
from flask_jwt_extended import jwt_required, get_jwt_identity
from decorator.verify_payload import verify_payload
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from exception.cannot_modify_this_attribute import CannotModifyThisAttribute


class UpdateMyUser(Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @catch_exception
    @verify_payload([])
    @jwt_required
    def post(self):
        input_data = request.get_json()

        if "password" in input_data:
            raise CannotModifyThisAttribute("password")
        if "email" in input_data:
            raise CannotModifyThisAttribute("email")
        if "is_admin" in input_data:
            raise CannotModifyThisAttribute("is_admin")
        if "is_active" in input_data:
            raise CannotModifyThisAttribute("is_active")

        input_data["id"] = int(get_jwt_identity())

        self.db.merge(input_data, self.db.tables["User"])

        return "", "200 "
