from flask_restful import Resource
from flask_jwt_extended import jwt_required
from db.db import DB
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access


class GetNewRequestCount(Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @catch_exception
    @jwt_required
    @verify_admin_access
    def get(self):

        data = self.db.session \
            .query(self.db.tables["UserRequest"]) \
            .filter(self.db.tables["UserRequest"].status == "NEW") \
            .count()

        return data, "200 "
