from flask_restful import Resource
from flask import request
from flask_jwt_extended import jwt_required, get_jwt_identity
from decorator.verify_payload import verify_payload
from decorator.catch_exception import catch_exception
from exception.object_not_found import ObjectNotFound
from decorator.log_request import log_request


class DeleteMyRequest(Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @catch_exception
    @verify_payload(format=[
        {'field': 'id', 'type': int}
    ])
    @jwt_required
    def post(self):
        input_data = request.get_json()

        companies = self.db.get(self.db.tables["UserRequest"], {
            "id": input_data["id"],
            "user_id": int(get_jwt_identity())
        })

        if len(companies) == 0:
            raise ObjectNotFound
        else:
            self.db.delete(self.db.tables["UserRequest"], {
                "id": input_data["id"],
                "user_id": int(get_jwt_identity())
            })

        return "", "200 "
