from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_restful import Resource
from webargs import fields

from decorator.catch_exception import catch_exception
from decorator.log_request import log_request


class AddMyFormAnswer(MethodResource, Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @doc(tags=['form'],
         description='Add a form',
         responses={
             "200": {},
             "500": {"description": "Too much answers found for this question"},
         })
    @use_kwargs({
        'form_question_id': fields.Int(),
        'value': fields.Str(),
    })
    @jwt_required
    @catch_exception
    def post(self, **kwargs):

        answers = self.db.get(self.db.tables["FormAnswer"], {
            "user_id": get_jwt_identity(),
            "form_question_id": kwargs["form_question_id"],
        })

        if len(answers) == 0:
            kwargs["user_id"] = get_jwt_identity()
            self.db.insert(kwargs, self.db.tables["FormAnswer"])
        elif len(answers) == 1:
            answers[0].value = kwargs["value"]
            self.db.merge(answers[0], self.db.tables["FormAnswer"])
        else:
            return "", "500 Too much answers found for this question"

        return "", "200 "
