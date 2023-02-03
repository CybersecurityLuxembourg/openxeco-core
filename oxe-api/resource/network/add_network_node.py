from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_jwt_extended import fresh_jwt_required
from flask_restful import Resource
from webargs import fields

from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access


class AddNetworkNode(MethodResource, Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @doc(tags=['network'],
         description='Add a network node',
         responses={
             "200": {},
         })
    @use_kwargs({
        'api_endpoint': fields.Str(),
    })
    @fresh_jwt_required
    @verify_admin_access
    @catch_exception
    def post(self, **kwargs):

        self.db.insert(kwargs, self.db.tables["NetworkNode"])

        return "", "200 "
