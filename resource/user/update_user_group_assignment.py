from flask_restful import Resource
from flask_apispec import MethodResource
from flask_jwt_extended import jwt_required
from decorator.verify_admin_access import verify_admin_access
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from exception.object_not_found import ObjectNotFound
from webargs import fields
from flask_apispec import use_kwargs, doc


class UpdateUserGroupAssignment(MethodResource, Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @doc(tags=['user'],
         description='Update user group assignment',
         responses={
             "200": {},
             "422.a": {"description": "Object not found: group"},
             "422.b": {"description": "Object not found: user"}
         })
    @use_kwargs({
        'user': fields.Int(),
        'group': fields.Str(allow_none=True),
    })
    @jwt_required
    @verify_admin_access
    @catch_exception
    def post(self, **kwargs):

        users = self.db.get(self.db.tables["User"], {"id": kwargs["user"]})

        if len(users) == 0:
            raise ObjectNotFound("user")

        groups = self.db.get(self.db.tables["UserGroup"], {"id": kwargs["group"]})

        if len(groups) == 0:
            raise ObjectNotFound("group")

        self.db.delete(self.db.tables["UserGroupAssignment"], {"user_id": kwargs["user"]})

        self.db.insert({
            "user_id": kwargs["user"],
            "group_id": kwargs["group"]
        }, self.db.tables["UserGroupAssignment"])

        return "", "200 "
