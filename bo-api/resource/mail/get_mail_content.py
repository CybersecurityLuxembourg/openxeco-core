import os

from flask_apispec import MethodResource
from flask_apispec import doc
from flask_jwt_extended import jwt_required
from flask_restful import Resource

from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access


class GetMailContent(MethodResource, Resource):

    def __init__(self, db):
        self.db = db

    @log_request
    @doc(tags=['mail'],
         description='Get the HTML content of the specified mail template name (new_account or reset_password)',
         responses={
             "200": {},
             "404": {"description": "This mail template does not exist"},
         })
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
