from flask_apispec import MethodResource
from flask_apispec import doc
from flask_jwt_extended import jwt_required
from flask_restful import Resource

from db.db import DB
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access
from exception.object_not_found import ObjectNotFound
from utils.serializer import Serializer


class GetUserGroup(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @doc(tags=['user'],
         description='Get a user group by ID',
         responses={
             "200": {},
             "422": {"description": "Object not found"}
         })
    @jwt_required
    @verify_admin_access
    @catch_exception
    def get(self, id_):

        data = self.db.get(self.db.tables["UserGroup"], {"id": id_})

        if len(data) < 1:
            raise ObjectNotFound

        data = Serializer.serialize(data[0], self.db.tables["UserGroup"])

        return data, "200 "
