from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_restful import Resource
from webargs import fields

from db.db import DB
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from utils.serializer import Serializer


class GetMyRequests(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @doc(tags=['private'],
         description='Get the list of requests from the user authenticated by the token with status "NEW" or "IN PROCESS"',
         responses={
             "200": {},
         })
    @use_kwargs({
        'global_only': fields.Str(required=False, validate=lambda x: x == "true"),
    })
    @jwt_required
    @catch_exception
    def get(self, **kwargs):

        params = {
            "user_id": int(get_jwt_identity()),
            "status": ['NEW', 'IN PROCESS']
        }

        if "global_only" in kwargs and kwargs["global_only"] == "true":
            params["company_id"] = None

        data = self.db.get(self.db.tables["UserRequest"], params)
        data = Serializer.serialize(data, self.db.tables["UserRequest"])

        return data, "200 "
