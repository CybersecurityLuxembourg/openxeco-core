from flask_jwt_extended import jwt_required
from flask_restful import Resource
from db.db import DB
from decorator.catch_exception import catch_exception
from decorator.verify_admin_access import verify_admin_access
from utils.serializer import Serializer
from decorator.log_request import log_request


class GetNotifications(Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @jwt_required
    @verify_admin_access
    @catch_exception
    def get(self):

        data = {
            "new_requests": self.db.session
                                .query(self.db.tables["UserRequest"])
                                .filter(self.db.tables["UserRequest"].status == "NEW")
                                .count(),
            "data_control": self.db.session
                                .query(self.db.tables["DataControl"])
                                .count(),
        }

        return data, "200 "
