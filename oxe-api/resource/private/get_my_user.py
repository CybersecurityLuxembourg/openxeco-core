from flask_apispec import MethodResource
from flask_apispec import doc
from flask_jwt_extended import fresh_jwt_required, get_jwt_identity
from flask_restful import Resource

from db.db import DB
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request


class GetMyUser(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @doc(tags=['private'],
         description='Get information about the user authenticated by the token (excluding the password)',
         responses={
             "200": {},
             "401": {"description": "The user has not been found"},
         })
    @fresh_jwt_required
    @catch_exception
    def get(self):

        data = self.db.get(self.db.tables["User"], {"id": get_jwt_identity()})

        if len(data) == 0:
            return "", "401 The user has not been found"

        data = data[0].__dict__
        del data["password"]
        del data['_sa_instance_state']

        return data, "200 "
