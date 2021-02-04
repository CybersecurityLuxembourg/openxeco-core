from flask_restful import Resource
from flask import request
from flask_jwt_extended import jwt_required
from utils.verify_payload import verify_payload
from utils.log_request import log_request


class UpdateUserGroupAssignment(Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @verify_payload(format=[
        {'field': 'user', 'type': int},
        {'field': 'group', 'type': int, 'nullable': True},
    ])
    @jwt_required
    def post(self):
        input_data = request.get_json()

        self.db.delete(self.db.tables["UserGroupAssignment"], {"user_id": input_data["user"]})

        self.db.add({
            "user_id": input_data["user"],
            "group_id": input_data["group"]
        }, self.db.tables["UserGroupAssignment"])

        return "", "200 "
