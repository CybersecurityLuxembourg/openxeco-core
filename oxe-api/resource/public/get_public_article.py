from flask_apispec import MethodResource
from flask_apispec import doc
from flask_restful import Resource

from db.db import DB
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from exception.object_not_found import ObjectNotFound
from utils.serializer import Serializer
from utils.response import build_no_cors_response


class GetPublicArticle(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @doc(tags=['public'],
         description='Get an article by its ID',
         responses={
             "200": {},
             "422": {"description": "Object not found"},
         })
    @catch_exception
    def get(self, id_):

        data = self.db.get(self.db.tables["Article"], {"id": id_})

        if len(data) < 1:
            raise ObjectNotFound

        data = Serializer.serialize(data, self.db.tables["Article"])

        return build_no_cors_response(data[0]), "200 "
