from flask_apispec import MethodResource
from flask_apispec import doc
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_restful import Resource

from decorator.catch_exception import catch_exception
from decorator.log_request import log_request


class Unsubscribe(MethodResource, Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @doc(tags=['account'],
         description='Disable the communication agreement of the user authenticated by the token',
         responses={
             "200": {},
         })
    @jwt_required
    @catch_exception
    def post(self):

        data = self.db.get(self.db.tables["User"], {"id": get_jwt_identity()})

        if len(data) == 0:
            return "", "401 The user has not been found"

        params = {
            "id": get_jwt_identity(),
            "accept_communication": False,
        }

        self.db.merge(params, self.db.tables["User"])

        return "", "200 "
