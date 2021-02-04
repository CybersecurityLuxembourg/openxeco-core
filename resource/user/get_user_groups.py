from flask_restful import Resource
from flask_jwt_extended import jwt_required
from db.db import DB
from utils.catch_exception import catch_exception
from utils.log_request import log_request
from utils.serializer import Serializer


class GetUserGroups(Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @catch_exception
    @jwt_required
    def get(self):

        data = self.db.get(self.db.tables["UserGroup"])
        data = Serializer.serialize(data, self.db.tables["UserGroup"])

        return data, "200 "
