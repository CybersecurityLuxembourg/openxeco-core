from flask import request
from flask_restful import Resource
from flask_bcrypt import generate_password_hash
from flask_jwt_extended import get_jwt_identity
from flask_jwt_extended import jwt_required
from utils.re import has_password_format
from utils.verify_payload import verify_payload
from utils.log_request import log_request


class ResetPassword(Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @verify_payload(format=[
        {'field': 'new_password', 'type': str}
    ])
    @jwt_required
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
