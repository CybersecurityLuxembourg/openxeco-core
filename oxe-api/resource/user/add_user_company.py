from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_jwt_extended import jwt_required
from flask_restful import Resource
from webargs import fields

from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access
from exception.object_already_existing import ObjectAlreadyExisting


class AddUserCompany(MethodResource, Resource):

    def __init__(self, db):
        self.db = db

    @log_request
    @doc(tags=['user'],
         description='Add an assignment of a user to a company',
         responses={
             "200": {},
             "422.a": {"description": "Object already existing"},
         })
    @use_kwargs({
        'user_id': fields.Int(),
        'company_id': fields.Int(),
        'department': fields.Str(
            allow_none=True,
            validate=lambda x: x in ['TOP MANAGEMENT', 'HUMAN RESOURCE', 'MARKETING', 'FINANCE', 'OPERATION/PRODUCTION',
                                     'INFORMATION TECHNOLOGY', 'OTHER', None]),
    })
    @jwt_required
    @verify_admin_access
    @catch_exception
    def post(self, **kwargs):

        self.db.insert(kwargs, self.db.tables["UserCompanyAssignment"])

        return "", "200 "
