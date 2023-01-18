from flask import request, make_response
from flask_apispec import MethodResource
from flask_apispec import doc
from flask_jwt_extended import jwt_required
from flask_restful import Resource

from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from config.config import ENVIRONMENT


class Logout(MethodResource, Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @doc(tags=['account'],
         description='Remove the access and the refresh cookies by logging out',
         responses={
             "200": {},
         })
    @jwt_required
    @catch_exception
    def post(self):

        response = make_response({})

        response.set_cookie(
            "access_token_cookie",
            path="/",
            domain=None if ENVIRONMENT == "dev"
            else (request.host[len("api"):] if request.host.startswith("api") else request.host),
            secure=True,
            httponly=True,
            expires=0
        )

        response.set_cookie(
            "refresh_token_cookie",
            path="/",
            domain=None if ENVIRONMENT == "dev"
            else (request.host[len("api"):] if request.host.startswith("api") else request.host),
            secure=True,
            httponly=True,
            expires=0
        )

        return response
