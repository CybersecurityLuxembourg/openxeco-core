from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_jwt_extended import jwt_required, get_jwt_identity
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
         description='Add a form',
         responses={
             "200": {},
         })
    @use_kwargs({
        'form_question_id': fields.Int(),
        'value': fields.Str(),
    })
    @jwt_required
    @catch_exception
    def post(self, **kwargs):

        kwargs["user_id"] = get_jwt_identity()
        self.db.insert(kwargs, self.db.tables["FormAnswer"])

        return "", "200 "
