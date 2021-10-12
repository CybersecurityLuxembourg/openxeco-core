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


class GetCompanies(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @doc(tags=['company'],
         description='Get companies',
         responses={
             "200": {},
         })
    @use_kwargs({
        'name': fields.Str(required=False),
        'ecosystem_role': fields.DelimitedList(fields.Str(), required=False),
        'entity_type': fields.DelimitedList(fields.Str(), required=False),
        'startup_only': fields.Bool(required=False),
        'corebusiness_only': fields.Bool(required=False),
        'taxonomy_values': fields.DelimitedList(fields.Str(), required=False),
        'status': fields.DelimitedList(fields.Str(), required=False),
    }, location="query")
    @jwt_required
    @verify_admin_access
    @catch_exception
    def get(self, **kwargs):

        company_objects = self.db.get_filtered_companies(kwargs)
        data = Serializer.serialize(company_objects, self.db.tables["Company"])

        return data, "200 "
