from flask_apispec import MethodResource
from flask_apispec import doc
from flask_jwt_extended import jwt_required
from flask_restful import Resource

from db.db import DB
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access


class GetContactEnums(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @doc(tags=['contact'],
         description='Get enumerations of contact fields',
         responses={
             "200": {},
         })
    @jwt_required
    @verify_admin_access
    @catch_exception
    def get(self):

        data = {
            "type": self.db.tables["CompanyContact"].type.prop.columns[0].type.enums,
            "representative": self.db.tables["CompanyContact"].representative.prop.columns[0].type.enums,
            "department": self.db.tables["CompanyContact"].department.prop.columns[0].type.enums
        }

        return data, "200 "
