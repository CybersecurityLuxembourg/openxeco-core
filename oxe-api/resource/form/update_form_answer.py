from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_jwt_extended import jwt_required, get_jwt_identity
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
             "422.1": {"description": "No answer found for this user"},
             "500": {"description": "Too much answers found for this question"},
         })
    @use_kwargs({
        'id': fields.Int(),
        'value': fields.Str(required=False, allow_none=True),
    })
    @jwt_required
    @catch_exception
    def post(self, **kwargs):

        answers = self.db.get(self.db.tables["FormAnswer"], {
            "user_id": get_jwt_identity(),
            "id": kwargs["id"],
        })

        if len(answers) == 0:
            return "", "422 No answer found for this user"

        if len(answers) == 1:
            answers[0].value = kwargs["value"]
            self.db.merge(answers[0], self.db.tables["FormAnswer"])
        else:
            return "", "500 Too much answers found for this question"

        return "", "200 "
