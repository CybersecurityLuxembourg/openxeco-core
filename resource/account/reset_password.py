from flask import request
from flask_restful import Resource
from flask_bcrypt import generate_password_hash
from flask_jwt_extended import get_jwt_identity
from flask_jwt_extended import jwt_required
from utils.re import has_password_format
from decorator.verify_payload import verify_payload
from decorator.verify_admin_access import verify_admin_access
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request


class ResetPassword(Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @catch_exception
    @verify_payload(format=[
        {'field': 'new_password', 'type': str}
    ])
    @jwt_required
    @verify_admin_access
    def post(self):
        input_data = request.get_json()

        if not has_password_format(input_data["new_password"]):
            return "", "422 The new password does not have the right format"

        data = self.db.get(self.db.tables["User"], {"id": get_jwt_identity()})

        if len(data) < 1:
            return "", "500 The user has not been found"

        user = data[0]
        user.password = generate_password_hash(input_data["new_password"])

        self.db.merge(user, self.db.tables["User"])

        return "", "200 "
