from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_restful import Resource
from webargs import fields

from decorator.catch_exception import catch_exception
from decorator.log_request import log_request


class UpdateMyUser(MethodResource, Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @doc(tags=['private'],
         description='Update the user information related to the token. This is applicable to a limited'
                     ' number of fields',
         responses={
             "200": {},
         })
    @use_kwargs({
        'handle': fields.Str(required=False, allow_none=True),
        'last_name': fields.Str(required=False, allow_none=True),
        'first_name': fields.Str(required=False, allow_none=True),
        'telephone': fields.Str(required=False, allow_none=True),
        'accept_communication': fields.Bool(required=False),
        'accept_request_notification': fields.Bool(required=False),
        'accept_terms_and_conditions': fields.Bool(required=False),
        'vcard': fields.Str(required=False, allow_none=True),
        'is_vcard_public': fields.Bool(required=False),
    })
    @jwt_required
    @catch_exception
    def post(self, **kwargs):

        kwargs["id"] = int(get_jwt_identity())

        self.db.merge(kwargs, self.db.tables["User"])

        return "", "200 "
