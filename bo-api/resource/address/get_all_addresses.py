from flask_apispec import MethodResource
from flask_apispec import doc
from flask_jwt_extended import jwt_required
from flask_restful import Resource

from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access
from utils.serializer import Serializer


class GetAllAddresses(MethodResource, Resource):

    def __init__(self, db):
        self.db = db

    @log_request
    @doc(tags=['address'],
         description='Get all addresses',
         responses={
             "200": {},
         })
    @jwt_required
    @verify_admin_access
    @catch_exception
    def get(self):

        data = self.db.get(self.db.tables["Company_Address"])
        data = Serializer.serialize(data, self.db.tables["Company_Address"])

        return data, "200 "
