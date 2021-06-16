from flask_restful import Resource
from flask_apispec import MethodResource
from db.db import DB
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_apispec import doc


class IsLogged(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @doc(tags=['private'],
         description='Get the status of the provided token',
         responses={
             "200": {},
         })
    @jwt_required
    @catch_exception
    def get(self):

        data = self.db.get(self.db.tables["User"], {"id": get_jwt_identity()})

        if len(data) == 0:
            return {
                "is_logged": False,
                "email": None,
            }, "200 "

        data = {
            "is_logged": True,
            "email": data[0].email,
        }

        return data, "200 "
