from flask import request
from flask_jwt_extended import jwt_required
from flask_restful import Resource

from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access
from decorator.verify_payload import verify_payload
from exception.object_not_found import ObjectNotFound


class DeleteCompany(Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @catch_exception
    @verify_payload(format=[
        {'field': 'id', 'type': int}
    ])
    @jwt_required
    @verify_admin_access
    def post(self):
        input_data = request.get_json()

        companies = self.db.get(self.db.tables["Company"], {"id": input_data["id"]})

        if len(companies) == 0:
            raise ObjectNotFound
        else:
            self.db.delete(self.db.tables["Company"], {"id": input_data["id"]})

        return "", "200 "
