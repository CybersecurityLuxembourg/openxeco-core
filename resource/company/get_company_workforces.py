from flask_restful import Resource
from flask_jwt_extended import jwt_required
from db.db import DB
from decorator.catch_exception import catch_exception
from decorator.verify_admin_access import verify_admin_access
from utils.serializer import Serializer
from decorator.log_request import log_request


class GetCompanyWorkforces(Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @jwt_required
    @verify_admin_access
    @catch_exception
    def get(self, id_):

        data = self.db.get(self.db.tables["Workforce"], {"company": id_})
        data = Serializer.serialize(data, self.db.tables["Workforce"])

        return data, "200 "
