from flask_restful import Resource
from flask_apispec import MethodResource
from flask_jwt_extended import jwt_required
from decorator.catch_exception import catch_exception
import os
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access


class GetMailContent(MethodResource, Resource):

    def __init__(self, db):
        self.db = db

    @log_request
    @jwt_required
    @verify_admin_access
    @catch_exception
    def get(self, name):

        if name in ["new_account", "reset_password"]:
            with open(os.path.join(os.path.dirname(__file__), "..", "..", "template", f"{name}.html"), "r") as f:
                data = f.read()
        else:
            return "", "404 This mail template does not exist"

        return data, "200 "
