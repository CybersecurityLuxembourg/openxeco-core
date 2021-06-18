from flask_restful import Resource
from flask_apispec import MethodResource
from flask import request
from flask_jwt_extended import jwt_required
from decorator.verify_admin_access import verify_admin_access
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from exception.object_not_found import ObjectNotFound
from webargs import fields
from flask_apispec import use_kwargs, doc


class DeleteUserGroupRight(MethodResource, Resource):

    def __init__(self, db):
        self.db = db

    @log_request
    @doc(tags=['user'],
         description='Delete a user group right',
         responses={
             "200": {},
             "422": {"description": "Object not found"}
         })
    @use_kwargs({
        'group': fields.Int(),
        'resource': fields.Str(),
    })
    @jwt_required
    @verify_admin_access
    @catch_exception
    def post(self):
        input_data = request.get_json()

        row = {
            "group_id": input_data["group"],
            "resource": input_data["resource"],
        }

        rights = self.db.get(self.db.tables["UserGroupRight"], row)

        if len(rights) > 0:
            self.db.delete(self.db.tables["UserGroupRight"], row)
        else:
            raise ObjectNotFound

        return "", "200 "
