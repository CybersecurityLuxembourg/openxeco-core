from flask_restful import Resource
from flask_apispec import MethodResource
from flask import request
from flask_jwt_extended import jwt_required
from decorator.verify_payload import verify_payload
from decorator.verify_admin_access import verify_admin_access
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request


class UpdateRequest(MethodResource, Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @verify_payload([
        {'field': 'id', 'type': int}
    ])
    @jwt_required
    @verify_admin_access
    @catch_exception
    def post(self):
        input_data = request.get_json()

        self.db.merge(input_data, self.db.tables["UserRequest"])

        return "", "200 "
