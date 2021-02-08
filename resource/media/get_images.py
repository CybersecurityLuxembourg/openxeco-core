from flask_restful import Resource
from flask_jwt_extended import jwt_required
from db.db import DB
from utils.serializer import Serializer
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request


class GetImages(Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @catch_exception
    @jwt_required
    def get(self):

        images = self.db.get(self.db.tables["Image"])
        data = Serializer.serialize(images, self.db.tables["Image"])

        return data, "200 "
