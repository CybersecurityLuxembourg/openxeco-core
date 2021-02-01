from flask_restful import Resource
from flask_jwt_extended import jwt_required
from db.db import DB
from utils.catch_exception import catch_exception
from utils.log_request import log_request


class GetCompanyEnums(Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @catch_exception
    @jwt_required
    def get(self):

        data = {
            "type": self.db.tables["Company"].type.prop.columns[0].type.enums,
            "editus_status": self.db.tables["Company"].editus_status.prop.columns[0].type.enums
        }

        return data, "200 "
