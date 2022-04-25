from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_jwt_extended import jwt_required
from flask_restful import Resource
from webargs import fields

from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access


class UpdateFormQuestionOrder(MethodResource, Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @doc(tags=['form'],
         description='Update the order of the questions of a form',
         responses={
             "200": {},
             "422": {"description": "The provided question IDs does not match the form questions"},
         })
    @use_kwargs({
        'form_id': fields.Int(required=True),
        'question_order': fields.List(fields.Int(), required=True),
    })
    @jwt_required
    @verify_admin_access
    @catch_exception
    def post(self, **kwargs):

        questions = self.db.get(self.db.tables["FormQuestion"], {"form_id": kwargs["form_id"]})

        if len(kwargs["question_order"]) != len(questions):
            return "", "422 The provided question IDs does not match the form questions"

        for q in questions:
            if q.id not in kwargs["question_order"]:
                return "", "422 The provided question IDs does not match the form questions"

        for i, ident in enumerate(kwargs["question_order"], start=1):
            question = [q for q in questions if q.id == ident][0]
            question.position = i

        self.db.merge(questions, self.db.tables["FormQuestion"])

        return "", "200 "
