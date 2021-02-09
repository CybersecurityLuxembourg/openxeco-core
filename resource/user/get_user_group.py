from flask_restful import Resource
from flask_jwt_extended import jwt_required
from db.db import DB
from decorator.verify_admin_access import verify_admin_access
from exception.object_not_found import ObjectNotFound
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from utils.serializer import Serializer


class GetUserGroup(Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @catch_exception
    @jwt_required
    @verify_admin_access
    def get(self, id):

        data = self.db.get(self.db.tables["UserGroup"], {"id": id})

        if len(data) < 1:
            raise ObjectNotFound

        data = Serializer.serialize(data[0], self.db.tables["UserGroup"])

        return data, "200 "
