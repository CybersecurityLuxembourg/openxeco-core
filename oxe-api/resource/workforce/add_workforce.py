from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_jwt_extended import jwt_required
from flask_restful import Resource
from webargs import fields
from datetime import datetime

from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access
from utils.re import has_date_format


class AddWorkforce(MethodResource, Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @doc(tags=['user'],
         description='Add workforce information to a company',
         responses={
             "200": {},
             "422.a": {"description": "Provided date does not have the right format (expected: YYYY-mm-dd)"},
             "422.c": {"description": "Provided company not existing"}
         })
    @use_kwargs({
        'company': fields.Int(),
        'workforce': fields.Int(),
        'date': fields.Str(required=False, missing=datetime.today().strftime('%Y-%m-%d')),
        'is_estimated': fields.Bool(required=False, missing=False),
        'source': fields.Str(required=False, allow_none=True),
    })
    @jwt_required
    @verify_admin_access
    @catch_exception
    def post(self, **kwargs):

        # Checking date

        if not has_date_format(kwargs["date"]):
            return "", "422 Provided date does not have the right format (expected: YYYY-mm-dd)"

        # Checking company

        company = self.db.get(self.db.tables["Company"], {"id": kwargs["company"]})

        if len(company) == 0:
            return "", "422 Provided company not existing"

        # Insert

        self.db.insert(kwargs, self.db.tables["Workforce"])

        return "", "200 "
