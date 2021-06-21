from flask import request
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
        'ecosystem_role': fields.List(fields.Str(), required=False),
        'entity_type': fields.List(fields.Str(), required=False),
        'startup_only': fields.Str(required=False, validate=lambda x: x == "true"),
        'corebusiness_only': fields.Str(required=False, validate=lambda x: x == "true"),
        'taxonomy_values': fields.List(fields.Str(), required=False),
    }, location="query")
    @jwt_required
    @verify_admin_access
    @catch_exception
    def get(self):

        filters = request.args.to_dict()
        company_objects = self.db.get_filtered_companies(filters)
        data = Serializer.serialize(company_objects, self.db.tables["Company"])

        return data, "200 "
