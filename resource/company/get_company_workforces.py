from flask_restful import Resource
from flask_jwt_extended import jwt_required
from db.db import DB
from decorator.catch_exception import catch_exception
from utils.serializer import Serializer
from decorator.log_request import log_request


class GetCompanyWorkforces(Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @catch_exception
    @jwt_required
    def get(self, id):

        data = self.db.get(self.db.tables["Workforce"], {"company": id})
        data = Serializer.serialize(data, self.db.tables["Workforce"])

        return data, "200 "
