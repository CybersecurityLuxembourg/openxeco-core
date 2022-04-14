from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_jwt_extended import jwt_required
from flask_restful import Resource
from webargs import fields

from db.db import DB
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access
from utils.serializer import Serializer


class GetFormQuestions(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @doc(tags=['form'],
         description='Get the form questions by its ID',
         responses={
             "200": {},
         })
    @use_kwargs({
        'form_id': fields.Int(required=True),
    }, location="query")
    @jwt_required
    @verify_admin_access
    @catch_exception
    def get(self, **kwargs):

        data = self.db.get(self.db.tables["FormQuestion"], kwargs)
        data = Serializer.serialize(data, self.db.tables["FormQuestion"])

        return data, "200 "
