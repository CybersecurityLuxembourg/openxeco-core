from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_jwt_extended import fresh_jwt_required
from flask_restful import Resource
from webargs import fields

from db.db import DB
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access
from utils.serializer import Serializer


class GetFormAnswers(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @doc(tags=['form'],
         description='Get the form answers',
         responses={
             "200": {},
         })
    @use_kwargs({
        'form_id': fields.Int(required=True),
    }, location="query")
    @fresh_jwt_required
    @verify_admin_access
    @catch_exception
    def get(self, **kwargs):

        questions = self.db.get(self.db.tables["FormQuestion"], {"form_id": kwargs["form_id"]})
        question_ids = [q.id for q in questions]
        data = self.db.get(self.db.tables["FormAnswer"], {"form_question_id": question_ids})
        data = Serializer.serialize(data, self.db.tables["FormAnswer"])

        return data, "200 "
