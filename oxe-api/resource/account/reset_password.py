from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_bcrypt import generate_password_hash
from flask_jwt_extended import get_jwt_identity
from flask_jwt_extended import fresh_jwt_required
from flask_restful import Resource
from webargs import fields

from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from utils.regex import has_password_format


class ResetPassword(MethodResource, Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @doc(tags=['account'],
         description='Change password of the user authenticated by the provided token',
         responses={
             "200": {},
             "401": {"description": "The user has not been found"},
             "422": {"description": "The new password does not have the right format"},
         })
    @use_kwargs({
        'new_password': fields.Str(),
    })
    @fresh_jwt_required
    @catch_exception
    def post(self, **kwargs):

        if not has_password_format(kwargs["new_password"]):
            return "", "422 The new password does not have the right format"

        data = self.db.get(self.db.tables["User"], {"id": get_jwt_identity()})

        if len(data) == 0:
            return "", "401 The user has not been found"

        user = data[0]
        user.password = generate_password_hash(kwargs["new_password"])

        self.db.merge(user, self.db.tables["User"])

        return "", "200 "
