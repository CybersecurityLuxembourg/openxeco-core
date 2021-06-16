from flask_restful import Resource
from flask_apispec import MethodResource
from flask_jwt_extended import jwt_required
from webargs import fields
from flask_apispec import use_kwargs, doc, marshal_with
from decorator.verify_admin_access import verify_admin_access
from decorator.catch_exception import catch_exception
from exception.object_not_found import ObjectNotFound
from decorator.log_request import log_request


class DeleteContact(MethodResource, Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @doc(tags=['contact'], description='Delete an address related to a company')
    @use_kwargs({
        'id': fields.Int(),
    })
    @marshal_with(None, code=200)
    @marshal_with(None, code=422, description="422 Object not found")
    @jwt_required
    @verify_admin_access
    @catch_exception
    def post(self, **kwargs):

        companies = self.db.get(self.db.tables["CompanyContact"], {"id": kwargs["id"]})

        if len(companies) > 0:
            self.db.delete(self.db.tables["CompanyContact"], {"id": kwargs["id"]})
        else:
            raise ObjectNotFound

        return "", "200 "
