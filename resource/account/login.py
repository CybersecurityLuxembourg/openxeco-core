from flask_restful import Resource
from flask_apispec import MethodResource
from flask import request
from flask_bcrypt import check_password_hash
from flask_jwt_extended import create_access_token, create_refresh_token
import datetime
from decorator.verify_payload import verify_payload
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request


class Login(MethodResource, Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @verify_payload([
        {'field': 'email', 'type': str},
        {'field': 'password', 'type': str},
    ])
    @catch_exception
    def post(self):
        input_data = request.get_json()

        data = self.db.get(self.db.tables["User"], {"email": input_data["email"]})

        if len(data) < 1 or not check_password_hash(data[0].password, input_data['password']):
            return "", "401 Wrong email/password combination"

        if not data[0].is_active:
            return "", "401 The account is not active. Please contact the administrator"

        access_token_expires = datetime.timedelta(days=1)
        refresh_token_expires = datetime.timedelta(days=365)
        access_token = create_access_token(identity=str(data[0].id), expires_delta=access_token_expires)
        refresh_token = create_refresh_token(identity=str(data[0].id), expires_delta=refresh_token_expires)

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
        }, "200 "
