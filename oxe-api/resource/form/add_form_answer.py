from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_jwt_extended import jwt_required
from flask_restful import Resource
from webargs import fields

from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access


class AddFormAnswer(MethodResource, Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @doc(tags=['form'],
         description='Add a form answer',
         responses={
             "200": {},
             "422": {"description": "An answer already found for this question and this user"},
             "500": {"description": "Too much answers found for this question"},
         })
    @use_kwargs({
        'user_id': fields.Int(),
        'form_question_id': fields.Int(),
        'value': fields.Str(),
    })
    @jwt_required
    @verify_admin_access
    @catch_exception
    def post(self, **kwargs):

        answers = self.db.get(self.db.tables["FormAnswer"], {
            "user_id": kwargs["user_id"],
            "form_question_id": kwargs["form_question_id"],
        })

        if len(answers) == 0:
            self.db.insert(kwargs, self.db.tables["FormAnswer"])
        elif len(answers) == 1:
            return "", "422 An answer already found for this question and this user"
        else:
            return "", "500 Too much answers found for this question"

        return "", "200 "
