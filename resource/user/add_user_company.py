from flask_restful import Resource
from flask_apispec import MethodResource
from flask_jwt_extended import jwt_required
from decorator.verify_admin_access import verify_admin_access
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from exception.object_already_existing import ObjectAlreadyExisting
from webargs import fields
from flask_apispec import use_kwargs, doc


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
        'user': fields.Int(),
        'company': fields.Int(),
    })
    @jwt_required
    @verify_admin_access
    @catch_exception
    def post(self, **kwargs):

        row = {
            "user_id": kwargs["user"],
            "company_id": kwargs["company"],
        }

        if len(self.db.get(self.db.tables["UserCompanyAssignment"], row)) > 0:
            raise ObjectAlreadyExisting

        self.db.insert(row, self.db.tables["UserCompanyAssignment"])

        return "", "200 "
