from flask_restful import Resource
from flask_apispec import MethodResource
from flask import request
from flask_jwt_extended import jwt_required
from decorator.verify_admin_access import verify_admin_access
from decorator.catch_exception import catch_exception
from exception.object_not_found import ObjectNotFound
from decorator.log_request import log_request
from webargs import fields
from flask_apispec import use_kwargs, doc


class DeleteUser(MethodResource, Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @doc(tags=['user'],
         description='Delete a user',
         responses={
             "200": {},
             "422": {"description": "Object not found"}
         })
    @use_kwargs({
        'id': fields.Int(),
    })
    @jwt_required
    @verify_admin_access
    @catch_exception
    def post(self, **kwargs):

        companies = self.db.get(self.db.tables["User"], {"id": kwargs["id"]})

        if len(companies) > 0:
            self.db.delete(self.db.tables["User"], {"id": kwargs["id"]})
        else:
            raise ObjectNotFound
            
        return "", "200 "
