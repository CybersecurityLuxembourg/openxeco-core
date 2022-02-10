from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_jwt_extended import jwt_required
from flask_restful import Resource
from webargs import fields

from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access


class AddContact(MethodResource, Resource):

    def __init__(self, db):
        self.db = db

    @log_request
    @doc(tags=['contact'],
         description='Add a contact related to a company',
         responses={
             "200": {},
             "422": {"description": "Provided company not existing"},
         })
    @use_kwargs({
        'company_id': fields.Int(),
        'type': fields.Str(),
        'representative': fields.Str(required=False, allow_none=True),
        'name': fields.Str(required=False, allow_none=True),
        'value': fields.Str(required=False, allow_none=True),
        'department': fields.Str(
            allow_none=True,
            validate=lambda x: x in ['TOP MANAGEMENT', 'HUMAN RESOURCE', 'MARKETING', 'FINANCE', 'OPERATION/PRODUCTION',
                                     'INFORMATION TECHNOLOGY', 'OTHER', None]),
    })
    @jwt_required
    @verify_admin_access
    @catch_exception
    def post(self, **kwargs):

        # Checking company

        company = self.db.get(self.db.tables["Company"], {"id": kwargs["company_id"]})

        if len(company) == 0:
            return "", "422 Provided company not existing"

        # Insert

        self.db.insert(kwargs, self.db.tables["CompanyContact"])

        return "", "200 "
