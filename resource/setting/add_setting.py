from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_jwt_extended import jwt_required
from flask_restful import Resource
from webargs import fields

from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access


class AddSetting(MethodResource, Resource):

    def __init__(self, db):
        self.db = db

    @log_request
    @doc(tags=['setting'],
         description='Add a global setting',
         responses={
             "200": {},
             "422": {"description": "Provided setting already exists"},
         })
    @use_kwargs({
        'property': fields.Str(),
        'value': fields.Str(),
    })
    @jwt_required
    @verify_admin_access
    @catch_exception
    def post(self, **kwargs):

        # Checking settings

        settings = self.db.get(self.db.tables["Setting"], {"property": kwargs["property"]})

        if len(settings) > 0:
            return "", "422 Provided setting already exists"

        # Insert

        self.db.insert(kwargs, self.db.tables["Setting"])

        return "", "200 "
