from flask_restful import Resource
from flask_apispec import MethodResource
from flask import request
from webargs import fields
from flask_apispec import use_kwargs, doc, marshal_with
from flask_jwt_extended import jwt_required
from decorator.verify_admin_access import verify_admin_access
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request


class UpdateAddress(MethodResource, Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @doc(tags=['address'], description='Update an address related to a company')
    @use_kwargs({
        'company_id': fields.Int(),
        'address_1': fields.Str(required=False),
        'address_2': fields.Str(required=False, allow_none=True),
        'number': fields.Str(required=False, allow_none=True),
        'postal_code': fields.Str(required=False, allow_none=True),
        'city': fields.Str(required=False),
        'administrative_area': fields.Str(required=False, allow_none=True),
        'country': fields.Str(required=False),
        'latitude': fields.Float(required=False, allow_none=True),
        'longitude': fields.Float(required=False, allow_none=True),
    })
    @marshal_with(None, code=200)
    @jwt_required
    @verify_admin_access
    @catch_exception
    def post(self, **kwargs):

        self.db.merge(kwargs, self.db.tables["Company_Address"])

        return "", "200 "
