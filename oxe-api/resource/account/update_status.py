import json
from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_jwt_extended import get_jwt_identity, jwt_required
from flask_restful import Resource
from webargs import fields

from decorator.catch_exception import catch_exception
from decorator.log_request import log_request


class UpdateStatus(MethodResource, Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @doc(tags=['account'],
         description='Update the status of the user',
         responses={
             "200": {},
             "401": {"description": "The user has not been found"},
             "422.a": {"description": "The password is wrong"},
             "422.b": {"description": "The new password does not have the right format"},
         })
    @use_kwargs({
        'status': fields.Str(allow_none=True,
            validate=lambda x: x in ['NEW', 'VERIFIED', 'REQUESTED', 'ACCEPTED', 'REJECTED']
        ),
    })
    @jwt_required
    @catch_exception
    def post(self, **kwargs):

        data = self.db.get(self.db.tables["User"], {"id": get_jwt_identity()})
        if len(data) == 0:
            return "", "401 The user has not been found"
        user = data[0]

        try:
            user_dict = user.__dict__
            values_before = {
                key: user_dict[key]
                for key in kwargs.keys()
            }
            self.db.insert({
                "entity_type": "User",
                "entity_id": user.id,
                "action": "Update User Status",
                "values_before": json.dumps(values_before),
                "values_after": json.dumps(kwargs),
                "user_id": user.id,
            }, self.db.tables["AuditRecord"])
        except Exception as err:
            # We don't want the app to error if we can't log the action
            print(err)

        user.status = kwargs["status"]

        self.db.merge(user, self.db.tables["User"])

        return "", "200 "
