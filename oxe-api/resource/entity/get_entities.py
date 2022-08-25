from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_jwt_extended import jwt_required
from flask_restful import Resource
from webargs import fields

from db.db import DB
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access
from utils.serializer import Serializer


class GetEntities(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @doc(tags=['entity'],
         description='Get entities',
         responses={
             "200": {},
         })
    @use_kwargs({
        'name': fields.Str(required=False),
        'startup_only': fields.Bool(required=False),
        'corebusiness_only': fields.Bool(required=False),
        'taxonomy_values': fields.DelimitedList(fields.Int(), required=False),
        'status': fields.DelimitedList(fields.Str(), required=False),
        'legal_status': fields.DelimitedList(fields.Str(
            validate=lambda x: x in ['JURIDICAL PERSON', 'NATURAL PERSON', 'OTHER'],
            required=False,
        )),
    }, location="query")
    @jwt_required
    @verify_admin_access
    @catch_exception
    def get(self, **kwargs):

        entity_objects = self.db.get_filtered_entities(kwargs).all()
        data = Serializer.serialize(entity_objects, self.db.tables["Entity"])

        return data, "200 "
