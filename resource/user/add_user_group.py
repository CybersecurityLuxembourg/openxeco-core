from flask_restful import Resource
from flask import request
from flask_jwt_extended import jwt_required
from decorator.verify_payload import verify_payload
from decorator.verify_admin_access import verify_admin_access
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request


class AddUserGroup(Resource):

    def __init__(self, db):
        self.db = db

    @log_request
    @verify_payload([
        {'field': 'name', 'type': str},
    ])
    @jwt_required
    @verify_admin_access
    @catch_exception
    def post(self):
        input_data = request.get_json()

        self.db.insert({"name": input_data["name"]}, self.db.tables["UserGroup"])

        return "", "200 "
