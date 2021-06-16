from flask_restful import Resource
from flask_apispec import MethodResource
from flask_jwt_extended import jwt_required
from flask_apispec import doc, marshal_with
from db.db import DB
from decorator.verify_admin_access import verify_admin_access
from utils.serializer import Serializer
from exception.object_not_found import ObjectNotFound
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request


class GetAddress(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @doc(tags=['address'], description='Get an address by its ID')
    @marshal_with(None, code=200)
    @marshal_with(None, code=422, description="Object not found")
    @jwt_required
    @verify_admin_access
    @catch_exception
    def get(self, id_):

        data = self.db.get(self.db.tables["Company_Address"], {"id": id_})

        if len(data) < 1:
            raise ObjectNotFound

        data = Serializer.serialize(data, self.db.tables["Company_Address"])

        return data[0], "200 "
