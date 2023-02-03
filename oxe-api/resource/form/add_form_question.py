from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_jwt_extended import fresh_jwt_required
from flask_restful import Resource
from webargs import fields

from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access
from utils.serializer import Serializer


class AddFormQuestion(MethodResource, Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @doc(tags=['form'],
         description='Add a form',
         responses={
             "200": {},
             "422": {"description": "The provided form ID does not exist"},
         })
    @use_kwargs({
        'form_id': fields.Int(),
    })
    @fresh_jwt_required
    @verify_admin_access
    @catch_exception
    def post(self, **kwargs):

        if len(self.db.get(self.db.tables["Form"], {"id": kwargs["form_id"]})) == 0:
            return "", "422 The provided form ID does not exist"

        questions = self.db.get(self.db.tables["FormQuestion"], kwargs)
        biggest_pos = 0

        if len(questions) > 0:
            biggest_pos = max([q.position for q in questions])

        question = self.db.insert({
            **{"position": biggest_pos + 1},
            **kwargs,
        }, self.db.tables["FormQuestion"])

        return Serializer.serialize(question, self.db.tables["FormQuestion"]), "200 "
