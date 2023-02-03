from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_jwt_extended import fresh_jwt_required
from flask_restful import Resource
from webargs import fields

from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from exception.object_not_found import ObjectNotFound


class DeleteMyFormAnswer(MethodResource, Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @doc(tags=['form'],
         description='Delete a form answer',
         responses={
             "200": {},
             "422": {"description": "Object not found"},
         })
    @use_kwargs({
        'id': fields.Int(),
    })
    @fresh_jwt_required
    @catch_exception
    def post(self, **kwargs):

        forms = self.db.get(self.db.tables["FormAnswer"], {"id": kwargs["id"]})

        if len(forms) > 0:
            self.db.delete(self.db.tables["FormAnswer"], {"id": kwargs["id"]})
        else:
            raise ObjectNotFound

        return "", "200 "
