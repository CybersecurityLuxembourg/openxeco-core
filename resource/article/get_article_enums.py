from flask_restful import Resource
from flask_jwt_extended import jwt_required
from db.db import DB
from utils.catch_exception import catch_exception
from utils.log_request import log_request


class GetArticleEnums(Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @catch_exception
    @jwt_required
    def get(self):

        data = {
            "status": self.db.tables["Article"].status.prop.columns[0].type.enums,
            "media": self.db.tables["Article"].media.prop.columns[0].type.enums,
            "type": self.db.tables["Article"].type.prop.columns[0].type.enums
        }

        return data, "200 "
