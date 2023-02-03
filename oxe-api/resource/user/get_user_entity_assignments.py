from flask_apispec import MethodResource
from flask_apispec import doc
from flask_jwt_extended import fresh_jwt_required
from flask_restful import Resource

from db.db import DB
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access
from utils.serializer import Serializer


class GetUserEntityAssignments(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @doc(tags=['user'],
         description='Get user entity assignments',
         responses={
             "200": {},
         })
    @fresh_jwt_required
    @verify_admin_access
    @catch_exception
    def get(self):

        data = self.db.get(self.db.tables["UserEntityAssignment"])
        data = Serializer.serialize(data, self.db.tables["UserEntityAssignment"])

        return data, "200 "
