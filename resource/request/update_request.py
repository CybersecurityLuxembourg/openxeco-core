from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_jwt_extended import jwt_required
from flask_restful import Resource
from webargs import fields

from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access


class UpdateRequest(MethodResource, Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @doc(tags=['request'],
         description='Update a request',
         responses={
             "200": {},
         })
    @use_kwargs({
        'id': fields.Int(),
        'user_id': fields.Int(required=False, allow_none=True),
        'company_id': fields.Int(required=False, allow_none=True),
        'status': fields.Int(required=False),
        'request': fields.Int(required=False, allow_none=True),
        'data': fields.Str(required=False, allow_none=True),
        'image': fields.Int(required=False, allow_none=True),
        'submission_date': fields.Str(required=False, allow_none=True),
        'type': fields.Str(required=False, allow_none=True),
    })
    @jwt_required
    @verify_admin_access
    @catch_exception
    def post(self, **kwargs):

        self.db.merge(kwargs, self.db.tables["UserRequest"])

        return "", "200 "
