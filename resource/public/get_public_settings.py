from flask_apispec import MethodResource
from flask_apispec import doc
from flask_restful import Resource

from db.db import DB
from decorator.catch_exception import catch_exception
from utils.serializer import Serializer


class GetPublicSettings(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @doc(tags=['public'],
         description='Get the global settings',
         responses={
             "200": {},
         })
    @catch_exception
    def get(self):

        data = self.db.get(self.db.tables["Setting"])
        data = Serializer.serialize(data, self.db.tables["Setting"])

        return data, "200 "
