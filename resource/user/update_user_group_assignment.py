from flask_restful import Resource
from flask import request
from flask_jwt_extended import jwt_required
from decorator.verify_payload import verify_payload
from decorator.verify_admin_access import verify_admin_access
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request


class UpdateUserGroupAssignment(Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @catch_exception
    @verify_payload(format=[
        {'field': 'user', 'type': int},
        {'field': 'group', 'type': int, 'nullable': True},
    ])
    @jwt_required
    @verify_admin_access
    def post(self):
        input_data = request.get_json()

        self.db.delete(self.db.tables["UserGroupAssignment"], {"user_id": input_data["user"]})

        self.db.insert({
            "user_id": input_data["user"],
            "group_id": input_data["group"]
        }, self.db.tables["UserGroupAssignment"])

        return "", "200 "
