from flask_apispec import MethodResource
from flask_apispec import doc
from flask_jwt_extended import fresh_jwt_required
from flask_restful import Resource

from db.db import DB
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from utils.serializer import Serializer


class GetMyForms(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @doc(tags=['private'],
         description='Get the forms that are visible by the community',
         responses={
             "200": {},
         })
    @fresh_jwt_required
    @catch_exception
    def get(self):

        data = self.db.get(self.db.tables["Form"], {"status": "ACTIVE"})
        data = Serializer.serialize(data, self.db.tables["Form"])

        return data, "200 "
