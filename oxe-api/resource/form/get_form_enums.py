from flask_apispec import MethodResource
from flask_apispec import doc
from flask_jwt_extended import jwt_required
from flask_restful import Resource

from db.db import DB
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access


class GetFormEnums(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @doc(tags=['form'],
         description='Get enumerations of the form fields',
         responses={
             "200": {},
         })
    @jwt_required
    @verify_admin_access
    @catch_exception
    def get(self):

        data = {
            "status": self.db.tables["Form"].status.prop.columns[0].type.enums,
        }

        return data, "200 "
