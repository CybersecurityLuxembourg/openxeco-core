from flask_restful import Resource
from flask_apispec import MethodResource
from flask import request
from flask_jwt_extended import jwt_required
from decorator.verify_payload import verify_payload
from decorator.verify_admin_access import verify_admin_access
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from exception.object_already_existing import ObjectAlreadyExisting


class AddUserGroupRight(MethodResource, Resource):

    def __init__(self, db):
        self.db = db

    @log_request
    @verify_payload([
        {'field': 'group', 'type': int},
        {'field': 'resource', 'type': str},
    ])
    @jwt_required
    @verify_admin_access
    @catch_exception
    def post(self):
        input_data = request.get_json()

        row = {
            "group_id": input_data["group"],
            "resource": input_data["resource"],
        }

        if len(self.db.get(self.db.tables["UserGroupRight"], row)) > 0:
            raise ObjectAlreadyExisting

        self.db.insert(row, self.db.tables["UserGroupRight"])

        return "", "200 "
