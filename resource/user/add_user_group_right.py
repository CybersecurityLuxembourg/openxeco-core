from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_jwt_extended import jwt_required
from flask_restful import Resource
from webargs import fields

from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access
from exception.object_already_existing import ObjectAlreadyExisting


class AddUserGroupRight(MethodResource, Resource):

    def __init__(self, db):
        self.db = db

    @log_request
    @doc(tags=['user'],
         description='Add a user group right',
         responses={
             "200": {},
         })
    @use_kwargs({
        'group': fields.Int(),
        'resource': fields.Str(),
    })
    @jwt_required
    @verify_admin_access
    @catch_exception
    def post(self, **kwargs):

        row = {
            "group_id": kwargs["group"],
            "resource": kwargs["resource"],
        }

        if len(self.db.get(self.db.tables["UserGroupRight"], row)) > 0:
            raise ObjectAlreadyExisting

        self.db.insert(row, self.db.tables["UserGroupRight"])

        return "", "200 "
