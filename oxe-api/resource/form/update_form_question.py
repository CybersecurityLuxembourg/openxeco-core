from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_jwt_extended import fresh_jwt_required
from flask_restful import Resource
from webargs import fields

from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access


class UpdateFormQuestion(MethodResource, Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @doc(tags=['form'],
         description='Update a form question',
         responses={
             "200": {},
         })
    @use_kwargs({
        'id': fields.Int(),
        'position': fields.Int(required=False, allow_none=True),
        'type': fields.Str(required=False, validate=lambda x: x in ['TEXT', 'TEXTAREA', 'CHECKBOX', 'OPTIONS', 'SELECT']),
        'options': fields.Str(required=False, allow_none=True),
        'value': fields.Str(required=False, allow_none=True),
        'status': fields.Str(required=False, validate=lambda x: x in ['ACTIVE', 'INACTIVE', 'DELETED']),
        'reference': fields.Str(required=False, allow_none=True, validate=lambda x: x is None or len(x) <= 30),
    })
    @fresh_jwt_required
    @verify_admin_access
    @catch_exception
    def post(self, **kwargs):

        self.db.merge(kwargs, self.db.tables["FormQuestion"])

        return "", "200 "
