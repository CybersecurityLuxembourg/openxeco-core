from flask_restful import Resource
from flask_apispec import MethodResource
from webargs import fields
from flask_apispec import use_kwargs, doc, marshal_with
from flask_jwt_extended import jwt_required
from decorator.verify_admin_access import verify_admin_access
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request


class UpdateContact(MethodResource, Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @doc(tags=['contact'], description='Update a contact related to a company')
    @use_kwargs({
        'company_id': fields.Int(),
        'type': fields.Str(required=False),
        'representative': fields.Str(required=False, allow_none=True),
        'name': fields.Str(required=False, allow_none=True),
        'value': fields.Str(required=False, allow_none=True),
    })
    @marshal_with(None, code=200)
    @jwt_required
    @verify_admin_access
    @catch_exception
    def post(self, **kwargs):

        self.db.merge(kwargs, self.db.tables["CompanyContact"])

        return "", "200 "
