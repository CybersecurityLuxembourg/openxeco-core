from flask_apispec import MethodResource
from flask_apispec import doc
from flask_jwt_extended import jwt_required
from flask_restful import Resource

from db.db import DB
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access
from utils.serializer import Serializer


class GetUserCompanies(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @doc(tags=['user'],
         description='Get companies assigned to a user by user ID',
         responses={
             "200": {},
             "422": {"description": "Object not found"}
         })
    @jwt_required
    @verify_admin_access
    @catch_exception
    def get(self, id_):

        data = self.db.session \
            .query(self.db.tables["UserCompanyAssignment"]) \
            .filter(self.db.tables["UserCompanyAssignment"].user_id == int(id_)) \
            .all()

        data = Serializer.serialize(data, self.db.tables["UserCompanyAssignment"])

        return data, "200 "
