import datetime

from flask import make_response
from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_bcrypt import check_password_hash
from flask_jwt_extended import create_access_token, create_refresh_token
from flask_restful import Resource
from webargs import fields

from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from config.config import ENVIRONMENT, CORS_DOMAINS


class Login(MethodResource, Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @doc(tags=['account'],
         description='Create an access and a refresh cookie by log in with an email and a password',
         responses={
             "200": {},
             "401.a": {"description": "Wrong email/password combination"},
             "401.b": {"description": "The account is not active. Please contact the administrator"},
         })
    @use_kwargs({
        'email': fields.Str(),
        'password': fields.Str(),
    })
    @catch_exception
    def post(self, **kwargs):

        data = self.db.get(self.db.tables["User"], {"email": kwargs["email"]})

        # If the user is not found, we simulate the whole process with a blank password.
        # This is done to limit the time discrepancy factor against the user enumeration exploit
        # CF: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html

        password = data[0].password if len(data) > 0 else "Imp0ssiblePassword~~"

        if not check_password_hash(password, kwargs['password']):
            return "", "401 Wrong email/password combination"

        if not data[0].is_active:
            return "", "401 The account is not active. Please contact the administrator"

        access_token_expires = datetime.timedelta(days=1)
        refresh_token_expires = datetime.timedelta(days=365)
        access_token = create_access_token(identity=str(data[0].id), expires_delta=access_token_expires)
        refresh_token = create_refresh_token(identity=str(data[0].id), expires_delta=refresh_token_expires)

        response = make_response({
            "user": data[0].id,
        })

        response.set_cookie(
            "access_token_cookie",
            value=access_token,
            path="/",
            domain=None if ENVIRONMENT == "dev" else CORS_DOMAINS,
            secure=True,
            httponly=True
        )

        response.set_cookie(
            "refresh_token_cookie",
            value=refresh_token,
            path="/",
            domain=None if ENVIRONMENT == "dev" else CORS_DOMAINS,
            secure=True,
            httponly=True
        )

        return response
