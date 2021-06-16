from flask_restful import Resource
from flask_apispec import MethodResource
from flask_jwt_extended import jwt_required
from flask_apispec import use_kwargs, doc, marshal_with
from webargs import fields
from decorator.verify_admin_access import verify_admin_access
from decorator.catch_exception import catch_exception
from exception.object_not_found import ObjectNotFound
from decorator.log_request import log_request


class DeleteAddress(MethodResource, Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @doc(tags=['address'], description='Delete an address')
    @use_kwargs({
        'id': fields.Int(),
    })
    @marshal_with(None, code=200)
    @marshal_with(None, code=422, description="Object not found")
    @jwt_required
    @verify_admin_access
    @catch_exception
    def post(self, **kwargs):

        companies = self.db.get(self.db.tables["Company_Address"], {"id": kwargs["id"]})

        if len(companies) > 0:
            self.db.delete(self.db.tables["Company_Address"], {"id": kwargs["id"]})
        else:
            raise ObjectNotFound

        return "", "200 "
