from flask_restful import Resource
from flask import request
from flask_jwt_extended import jwt_required
from decorator.verify_payload import verify_payload
from decorator.verify_admin_access import verify_admin_access
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from exception.object_not_found import ObjectNotFound


class UpdateUserGroupAssignment(Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @catch_exception
    @verify_payload([
        {'field': 'user', 'type': int},
        {'field': 'group', 'type': int, 'nullable': True},
    ])
    @jwt_required
    @verify_admin_access
    def post(self):
        input_data = request.get_json()

        users = self.db.get(self.db.tables["User"], {"id": input_data["user"]})

        if len(users) == 0:
            raise ObjectNotFound("user")

        groups = self.db.get(self.db.tables["UserGroup"], {"id": input_data["group"]})

        if len(groups) == 0:
            raise ObjectNotFound("group")

        self.db.delete(self.db.tables["UserGroupAssignment"], {"user_id": input_data["user"]})

        self.db.insert({
            "user_id": input_data["user"],
            "group_id": input_data["group"]
        }, self.db.tables["UserGroupAssignment"])

        return "", "200 "
