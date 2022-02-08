from flask_apispec import use_kwargs, doc
from flask_apispec.views import MethodResource
from flask_jwt_extended import jwt_required
from flask_restful import Resource
from webargs import fields

from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access


class AddAddress(MethodResource, Resource):

    def __init__(self, db):
        self.db = db

    @log_request
    @doc(tags=['address'],
         description='Add an address related to a company',
         responses={
             "200": {},
             "422": {"description": "Provided company not existing"},
         })
    @use_kwargs({
        'company_id': fields.Int(),
        'address_1': fields.Str(),
        'address_2': fields.Str(required=False, allow_none=True),
        'number': fields.Str(required=False, allow_none=True),
        'postal_code': fields.Str(required=False, allow_none=True),
        'city': fields.Str(),
        'administrative_area': fields.Str(required=False, allow_none=True),
        'country': fields.Str(),
        'latitude': fields.Float(required=False, allow_none=True),
        'longitude': fields.Float(required=False, allow_none=True),
    })
    @jwt_required
    @verify_admin_access
    @catch_exception
    def post(self, **kwargs):

        # Checking company

        company = self.db.get(self.db.tables["Company"], {"id": kwargs["company_id"]})

        if len(company) == 0:
            return "", "422 Provided company not existing"

        # Insert

        self.db.insert(kwargs, self.db.tables["Company_Address"])

        return "", "200 "
