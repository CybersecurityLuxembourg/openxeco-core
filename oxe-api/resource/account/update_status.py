from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_jwt_extended import get_jwt_identity
from flask_jwt_extended import jwt_required
from flask_restful import Resource
from webargs import fields

from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from utils.re import has_password_format


class UpdateStatus(MethodResource, Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @doc(tags=['account'],
         description='Update the status of the user',
         responses={
             "200": {},
             "401": {"description": "The user has not been found"},
             "422.a": {"description": "The password is wrong"},
             "422.b": {"description": "The new password does not have the right format"},
         })
    @use_kwargs({
        'status': fields.Str(allow_none=True,
            validate=lambda x: x in ['NEW', 'VERIFIED', 'REQUESTED', 'ACCEPTED', 'REJECTED']
        ),
    })
    @jwt_required
    @catch_exception
    def post(self, **kwargs):

        data = self.db.get(self.db.tables["User"], {"id": get_jwt_identity()})
        if len(data) == 0:
            return "", "401 The user has not been found"
        user = data[0]

        user.status = kwargs["status"]

        self.db.merge(user, self.db.tables["User"])

        return "", "200 "
