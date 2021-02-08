from flask_restful import Resource
from flask_jwt_extended import jwt_required
from db.db import DB
from utils.serializer import Serializer
from exception.object_not_found import ObjectNotFound
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request


class GetCompany(Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @catch_exception
    @jwt_required
    def get(self, id):

        data = self.db.get(self.db.tables["Company"], {"id": id})

        if len(data) < 1:
            raise ObjectNotFound

        data = Serializer.serialize(data, self.db.tables["Company"])

        return data[0], "200 "
