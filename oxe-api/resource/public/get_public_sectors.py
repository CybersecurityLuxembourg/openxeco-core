from flask_apispec import MethodResource
from flask_apispec import doc
from flask_restful import Resource

from db.db import DB
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from exception.object_not_found import ObjectNotFound
from utils.serializer import Serializer


class GetPublicSectors(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @doc(tags=['public'],
         description='Get all sectors',
         responses={
             "200": {},
             "422": {"description": "Object not found"},
         })

    @catch_exception
    def get(self):

        data = self.db.get(self.db.tables["Sector"])
        if len(data) < 1:
            raise ObjectNotFound
        data = Serializer.serialize(data, self.db.tables["Sector"])
        return data, "200 "
