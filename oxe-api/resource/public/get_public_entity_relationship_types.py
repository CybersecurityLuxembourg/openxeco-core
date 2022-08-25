from flask_apispec import MethodResource
from flask_apispec import doc
from flask_restful import Resource

from db.db import DB
from decorator.catch_exception import catch_exception
from utils.serializer import Serializer
from utils.response import build_no_cors_response


class GetPublicEntityRelationshipTypes(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @doc(tags=['public'],
         description='Get relationship types',
         responses={
             "200": {},
         })
    @catch_exception
    def get(self):

        types = self.db.session \
            .query(self.db.tables["EntityRelationshipType"]) \
            .all()

        types = Serializer.serialize(types, self.db.tables["EntityRelationshipType"])

        return build_no_cors_response(types)
