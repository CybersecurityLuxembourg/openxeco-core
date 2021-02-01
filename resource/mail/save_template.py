from flask_restful import Resource
from flask import request
from flask_jwt_extended import jwt_required
from utils.verify_payload import verify_payload
import os
from utils.log_request import log_request


class SaveTemplate(Resource):

    def __init__(self, db):
        self.db = db

    @log_request
    @verify_payload(format=[
        {'field': 'name', 'type': str},
        {'field': 'content', 'type': str}
    ])
    @jwt_required
    def post(self):
        input_data = request.get_json()

        if input_data['name'] not in ["new_account", "reset_password"]:
            return "", "404 This mail template does not exist"
        else:
            name = input_data['name']
            with open(os.path.join(os.path.dirname(__file__), "..", "..", "template", f"{name}.html"), "r+") as f:
                f.read()
                f.seek(0)
                f.write(input_data['content'])
                f.truncate()

        return "", "200 "
