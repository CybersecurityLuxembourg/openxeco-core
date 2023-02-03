from flask_apispec import use_kwargs, doc
from flask_apispec.views import MethodResource
from flask_jwt_extended import fresh_jwt_required
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
         description='Add an address related to an entity',
         responses={
             "200": {},
             "422": {"description": "Provided entity not existing"},
         })
    @use_kwargs({
        'entity_id': fields.Int(),
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
    @fresh_jwt_required
    @verify_admin_access
    @catch_exception
    def post(self, **kwargs):

        # Checking entity

        entity = self.db.get(self.db.tables["Entity"], {"id": kwargs["entity_id"]})

        if len(entity) == 0:
            return "", "422 Provided entity not existing"

        # Insert

        self.db.insert(kwargs, self.db.tables["EntityAddress"])

        return "", "200 "
