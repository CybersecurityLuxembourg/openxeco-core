from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_restful import Resource
from webargs import fields

from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from exception.object_not_found import ObjectNotFound


class DeleteMyRequest(MethodResource, Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @doc(tags=['private'],
         description='Delete a request of the user related to the token',
         responses={
             "200": {},
             "422": {"description": "Object not found or you don't have the required access to it"}
         })
    @use_kwargs({
        'id': fields.Int(),
    })
    @jwt_required
    @catch_exception
    def post(self, **kwargs):

        companies = self.db.get(self.db.tables["UserRequest"], {
            "id": kwargs["id"],
            "user_id": int(get_jwt_identity())
        })

        if len(companies) > 0:
            self.db.delete(self.db.tables["UserRequest"], {
                "id": kwargs["id"],
                "user_id": int(get_jwt_identity())
            })
        else:
            raise ObjectNotFound

        return "", "200 "
