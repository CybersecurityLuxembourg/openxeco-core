from flask_apispec import use_kwargs, doc
from flask_apispec.views import MethodResource
from flask_jwt_extended import jwt_required
from flask_restful import Resource
from webargs import fields

from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access


class AddRelationship(MethodResource, Resource):

    def __init__(self, db):
        self.db = db

    @log_request
    @doc(tags=['relationship'],
         description='Add an relationship between two entities',
         responses={
             "200": {},
             "422": {"description": "Provided entity not existing"},
         })
    @use_kwargs({
        'entity_1': fields.Int(required=True, allow_none=False),
        'type': fields.Int(required=True, allow_none=False),
        'entity_2': fields.Int(required=True, allow_none=False),
    })
    @jwt_required
    @verify_admin_access
    @catch_exception
    def post(self, **kwargs):

        self.db.insert(kwargs, self.db.tables["EntityRelationship"])

        return "", "200 "
