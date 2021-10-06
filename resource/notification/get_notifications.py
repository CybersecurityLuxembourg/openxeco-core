from flask_apispec import MethodResource
from flask_apispec import doc
from flask_jwt_extended import jwt_required
from flask_restful import Resource

from db.db import DB
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access


class GetNotifications(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @doc(tags=['notification'],
         description='Get number of requests with a NEW status and number of data control result',
         responses={
             "200": {},
         })
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
            "articles_under_review": self.db.session
                                         .query(self.db.tables["Article"])
                                         .filter(self.db.tables["Article"].status == "UNDER REVIEW")
                                         .count(),
        }

        return data, "200 "
