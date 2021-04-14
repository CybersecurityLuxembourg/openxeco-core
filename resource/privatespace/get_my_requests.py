from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from db.db import DB
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from utils.serializer import Serializer


class GetMyRequests(Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @jwt_required
    @catch_exception
    def get(self):

        data = self.db.get(self.db.tables["UserRequest"], {
            "user_id": int(get_jwt_identity()),
            "status": ['NEW', 'IN PROCESS']
        })
        data = Serializer.serialize(data, self.db.tables["UserRequest"])

        return data, "200 "
