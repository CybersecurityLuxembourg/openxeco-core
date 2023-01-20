import json
from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_restful import Resource
from webargs import fields
from sqlalchemy.exc import IntegrityError

from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access
from exception.object_already_existing import ObjectAlreadyExisting


class AddUserEntity(MethodResource, Resource):

    def __init__(self, db):
        self.db = db

    @log_request
    @doc(tags=['user'],
         description='Add an assignment of a user to a entity',
         responses={
             "200": {},
             "422.a": {"description": "Object already existing"},
         })
    @use_kwargs({
        'user_id': fields.Int(),
        'entity_id': fields.Int(),
        'department': fields.Str(required=True, allow_none=False),
        'seniority_level': fields.Str(required=True, allow_none=False),
        'work_email': fields.Str(required=True, allow_none=False),
        'work_telephone': fields.Str(required=True, allow_none=False),
    })
    @jwt_required
    @verify_admin_access
    @catch_exception
    def post(self, **kwargs):

        try:
            self.db.insert(kwargs, self.db.tables["UserEntityAssignment"])
        except IntegrityError as e:
            self.db.session.rollback()
            if "Duplicate entry" in str(e):
                raise ObjectAlreadyExisting
            raise e

        try:
            self.db.insert({
                "entity_type": "UserEntityAssignment",
                "entity_id": kwargs["entity_id"],
                "action": "Add User Entity Assignment",
                "values_before": "{}",
                "values_after": json.dumps(kwargs),
                "user_id": get_jwt_identity(),
            }, self.db.tables["AuditRecord"])
        except Exception as err:
            # We don't want the app to error if we can't log the action
            print(err)

        return "", "200 "
