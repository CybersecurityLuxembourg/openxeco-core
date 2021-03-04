from flask_restful import Resource
from flask import request
from flask_bcrypt import check_password_hash
from flask_jwt_extended import create_access_token
import datetime
from decorator.verify_payload import verify_payload
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request


class Login(Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @catch_exception
    @verify_payload([
        {'field': 'email', 'type': str},
        {'field': 'password', 'type': str}
    ])
    def post(self):
        input_data = request.get_json()

        data = self.db.get(self.db.tables["User"], {"email": input_data["email"]})

        if len(data) < 1 or not check_password_hash(data[0].password, input_data['password']):
            return "", "401 Wrong email/password combination"

        if not data[0].is_active:
            return "", "401 The account is not active. Please contact the administrator"

        expires = datetime.timedelta(days=7)
        access_token = create_access_token(identity=str(data[0].id), expires_delta=expires)

        return {"token": access_token}, "200 "
