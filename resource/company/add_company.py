from flask_restful import Resource
from flask_apispec import MethodResource
from flask_jwt_extended import jwt_required
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access
from decorator.catch_exception import catch_exception
from webargs import fields
from flask_apispec import use_kwargs, doc


class AddCompany(MethodResource, Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @doc(tags=['company'],
         description='Add a company',
         responses={
             "200": {},
             "422": {"description": "A company is already existing with that name"},
         })
    @use_kwargs({
        'name': fields.Str(),
    })
    @jwt_required
    @verify_admin_access
    @catch_exception
    def post(self, **kwargs):

        companies = self.db.get(self.db.tables["Company"], {"name": kwargs["name"]})

        if len(companies) > 0:
            return "", "422 A company is already existing with that name"

        self.db.insert(kwargs, self.db.tables["Company"])

        return "", "200 "
