from flask_restful import Resource
from flask import request
from flask_jwt_extended import jwt_required
from utils.verify_payload import verify_payload
from exception.object_not_found import ObjectNotFound
from utils.log_request import log_request


class DeleteWorkforce(Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @verify_payload(format=[
        {'field': 'id', 'type': int}
    ])
    @jwt_required
    def post(self):
        input_data = request.get_json()

        workforce = self.db.get(self.db.tables["Workforce"], {"id": input_data["id"]})

        if len(workforce) == 0:
            raise ObjectNotFound
        else:
            self.db.delete(self.db.tables["Workforce"], {"id": input_data["id"]})

        return "", "200 "
