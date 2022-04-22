from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_restful import Resource
from webargs import fields

from db.db import DB
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from utils.serializer import Serializer


class GetMyFormAnswers(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @doc(tags=['private'],
         description='Get the form answer given by the authenticated user',
         responses={
             "200": {},
             "422.1": {"description": "Form ID not found"},
             "422.2": {"description": "The requested form is not accessible"},
         })
    @use_kwargs({
        'form_id': fields.Int(),
    }, location="query")
    @jwt_required
    @catch_exception
    def get(self, **kwargs):

        # Check existence and status of the form

        forms = self.db.get(self.db.tables["Form"], {"id": kwargs["form_id"]})

        if len(forms) < 1:
            return "", "422 Form ID not found"

        if forms[0].status != "ACTIVE":
            return "", "422 The requested form is not accessible"

        # Get the questions of the form

        questions = self.db.get(self.db.tables["FormQuestion"], {"form_id": forms[0].id, "status": "ACTIVE"})

        # Get the user answers

        answers = self.db.get(self.db.tables["FormAnswer"], {
            "user_id": get_jwt_identity(),
            "form_question_id": [q.id for q in questions],
        })

        answers = Serializer.serialize(answers, self.db.tables["FormAnswer"])

        return answers, "200 "
