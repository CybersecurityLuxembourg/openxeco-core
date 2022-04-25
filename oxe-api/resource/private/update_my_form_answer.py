from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_jwt_extended import jwt_required
from flask_restful import Resource
from webargs import fields

from decorator.catch_exception import catch_exception
from decorator.log_request import log_request


class UpdateFormAnswer(MethodResource, Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @doc(tags=['form'],
         description='Update a form answer',
         responses={
             "200": {},
         })
    @use_kwargs({
        'id': fields.Int(),
        'value': fields.Str(required=False, allow_none=True),
    })
    @jwt_required
    @catch_exception
    def post(self, **kwargs):

        self.db.merge(kwargs, self.db.tables["FormAnswer"])

        return "", "200 "
