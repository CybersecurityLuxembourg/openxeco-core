from flask_restful import Resource
from flask_jwt_extended import jwt_required
from db.db import DB
from exception.object_not_found import ObjectNotFound
from utils.catch_exception import catch_exception
from utils.log_request import log_request


class GetUser(Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @catch_exception
    @jwt_required
    def get(self, id):
        data = self.db.get(self.db.tables["User"], {"id": id})

        if len(data) < 1:
            raise ObjectNotFound

        data = data[0].__dict__
        del data["password"]
        del data['_sa_instance_state']

        return data, "200 "
