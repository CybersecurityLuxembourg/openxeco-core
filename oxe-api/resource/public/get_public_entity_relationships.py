from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_restful import Resource
from webargs import fields
from sqlalchemy import or_

from db.db import DB
from decorator.catch_exception import catch_exception
from utils.serializer import Serializer
from utils.response import build_no_cors_response


class GetPublicCompanyRelationships(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @doc(tags=['public'],
         description='Get the relationships of companies designated by their IDs',
         responses={
             "200": {},
         })
    @use_kwargs({
        'ids': fields.DelimitedList(fields.Int(), required=True),
    }, location="query")
    @catch_exception
    def get(self, **kwargs):

        relationships = self.db.session \
            .query(self.db.tables["CompanyRelationship"]) \
            .filter(or_(self.db.tables["CompanyRelationship"].entity_1.in_(kwargs["ids"]),
                        self.db.tables["CompanyRelationship"].entity_2.in_(kwargs["ids"]))) \
            .all()

        relationships = Serializer.serialize(relationships, self.db.tables["CompanyRelationship"])

        return build_no_cors_response(relationships)
