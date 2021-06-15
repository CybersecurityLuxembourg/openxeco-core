from flask_restful import Resource
from flask_apispec import MethodResource
from flask_jwt_extended import jwt_required, get_jwt_identity
from db.db import DB
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request


class GetMyUser(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @jwt_required
    @catch_exception
    def get(self):
        data = self.db.get(self.db.tables["User"], {"id": get_jwt_identity()})

        if len(data) == 0:
            return "", "401 The user has not been found"

        data = data[0].__dict__
        del data["password"]
        del data['_sa_instance_state']

        return data, "200 "
