from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_jwt_extended import jwt_required
from flask_restful import Resource
from webargs import fields

from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access


class AddFormQuestion(MethodResource, Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @doc(tags=['form'],
         description='Add a form',
         responses={
             "200": {},
         })
    @use_kwargs({
        'form_id': fields.Int(),
    })
    @jwt_required
    @verify_admin_access
    @catch_exception
    def post(self, **kwargs):

        questions = self.db.get(self.db.tables["FormQuestion"], kwargs)
        biggest_pos = -1

        if len(questions) > 0:
            biggest_pos = max([q.position for q in questions])

        print({
            **{"position": biggest_pos + 1},
            **kwargs,
        })

        self.db.insert({
            **{"position": biggest_pos + 1},
            **kwargs,
        }, self.db.tables["FormQuestion"])

        return "", "200 "
