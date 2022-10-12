from flask import request
from flask_apispec import MethodResource
from flask_apispec import doc
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_restful import Resource
from itsdangerous.exc import BadSignature

from decorator.catch_exception import catch_exception
from utils.token import confirm_token

class VerifyWorkEmail(MethodResource, Resource):

    db = None
    mail = None

    def __init__(self, db, mail):
        self.db = db
        self.mail = mail

    @doc(tags=['entity'],
         description='Verify new account using given token',
         responses={
             "200": {},
             "422.a": {"description": "The verification link is invalid"},
             "422.b": {"description": "The verification link has expired"},
         })
    @jwt_required
    @catch_exception
    def get(self, token):

        # Verify token
        try:
            email = confirm_token(token, None)
        except BadSignature:
            return "", "422 The verification link is invalid."

        # Get user
        data = self.db.get(self.db.tables["User"], {"id": get_jwt_identity()})

        if len(data) == 0:
            return "", "401 The user has not been found"

        user = data[0].__dict__

        # Set user to active
        if user["email"] != email:
            return "", "422 The verification link is invalid."

        return "", "200"