from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_restful import Resource
from webargs import fields
from sqlalchemy import or_

from db.db import DB
from decorator.catch_exception import catch_exception
from utils.serializer import Serializer
from utils.response import build_no_cors_response


class GetRelationshipTypes(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @doc(tags=['relationship'],
         description='Get relationship types',
         responses={
             "200": {},
         })
    @catch_exception
    def get(self):

        relationships = self.db.session \
            .query(self.db.tables["CompanyRelationshipType"]) \
            .all()

        relationships = Serializer.serialize(relationships, self.db.tables["CompanyRelationshipType"])

        return relationships, "200 "
