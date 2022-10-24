from flask_apispec import MethodResource
from flask_apispec import doc
from flask_restful import Resource

from db.db import DB
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from exception.object_not_found import ObjectNotFound
from utils.serializer import Serializer


class GetPublicDepartments(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @doc(tags=['public'],
         description='Get all departments',
         responses={
             "200": {},
             "422": {"description": "Object not found"},
         })

    @catch_exception
    def get(self):

        # data = self.db.get(self.db.tables["Department"])
        data = self.db.session \
            .query(self.db.tables["Department"]) \
            .order_by(self.db.tables["Department"].id) \
            .all()
        if len(data) < 1:
            raise ObjectNotFound
        data = Serializer.serialize(data, self.db.tables["Department"])
        return data, "200 "
