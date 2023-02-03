from flask_apispec import MethodResource
from flask_apispec import doc
from flask_jwt_extended import fresh_jwt_required, get_jwt_identity
from flask_restful import Resource

from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from exception.object_not_found import ObjectNotFound


class DeleteMyUser(MethodResource, Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @doc(tags=['private'],
         description='Delete the user identified by the token',
         responses={
             "200": {},
             "422": {"description": "Object not found"}
         })
    @fresh_jwt_required
    @catch_exception
    def post(self):

        user = self.db.get(self.db.tables["User"], {
            "id": int(get_jwt_identity())
        })

        if len(user) > 0:
            self.db.delete(self.db.tables["User"], {
                "id": int(get_jwt_identity())
            })
        else:
            raise ObjectNotFound

        return "", "200 "
