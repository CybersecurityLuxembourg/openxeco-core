from flask_jwt_extended import jwt_required
from flask_restful import Resource
from flask_apispec import MethodResource
from db.db import DB
from flask_apispec import doc, marshal_with
from decorator.catch_exception import catch_exception
from decorator.verify_admin_access import verify_admin_access
from decorator.log_request import log_request


class GetNotifications(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @doc(tags=['analytic'], description='Get number of requests with a NEW status and number of data control result')
    @marshal_with(None, code=200)
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
