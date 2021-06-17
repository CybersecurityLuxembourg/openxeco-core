from flask_restful import Resource
from flask_apispec import MethodResource
from flask_jwt_extended import jwt_required
from decorator.verify_admin_access import verify_admin_access
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from webargs import fields
from flask_apispec import use_kwargs, doc


class AddUserGroup(MethodResource, Resource):

    def __init__(self, db):
        self.db = db

    @log_request
    @doc(tags=['user'],
         description='Add a user group',
         responses={
             "200": {},
         })
    @use_kwargs({
        'name': fields.Str(),
    })
    @jwt_required
    @verify_admin_access
    @catch_exception
    def post(self, **kwargs):

        self.db.insert({"name": kwargs["name"]}, self.db.tables["UserGroup"])

        return "", "200 "
