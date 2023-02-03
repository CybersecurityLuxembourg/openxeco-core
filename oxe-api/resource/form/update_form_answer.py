from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_jwt_extended import fresh_jwt_required
from flask_restful import Resource
from webargs import fields

from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access


class UpdateFormAnswer(MethodResource, Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @doc(tags=['form'],
         description='Update a form answer',
         responses={
             "200": {},
             "422": {"description": "No answer found with this ID"},
         })
    @use_kwargs({
        'id': fields.Int(),
        'value': fields.Str(required=False, allow_none=True),
    })
    @fresh_jwt_required
    @verify_admin_access
    @catch_exception
    def post(self, **kwargs):

        answers = self.db.get(self.db.tables["FormAnswer"], {
            "id": kwargs["id"],
        })

        if len(answers) == 0:
            return "", "422 No answer found with this ID"

        answers[0].value = kwargs["value"]
        self.db.merge(answers[0], self.db.tables["FormAnswer"])

        return "", "200 "
