import os

from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_jwt_extended import jwt_required
from flask_restful import Resource
from webargs import fields

from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access


class SaveTemplate(MethodResource, Resource):

    def __init__(self, db):
        self.db = db

    @log_request
    @doc(tags=['mail'],
         description='Save the HTML content of the specified mail template name (new_account or reset_password)',
         responses={
             "200": {},
             "404": {"description": "This mail template does not exist"},
         })
    @use_kwargs({
        'name': fields.Str(),
        'content': fields.Str(),
    })
    @jwt_required
    @verify_admin_access
    @catch_exception
    def post(self, **kwargs):

        if kwargs['name'] in ["new_account", "reset_password"]:
            name = kwargs['name']
            with open(os.path.join(os.path.dirname(__file__), "..", "..", "template", f"{name}.html"), "r+") as f:
                f.read()
                f.seek(0)
                f.write(kwargs['content'])
                f.truncate()
        else:
            return "", "404 This mail template does not exist"

        return "", "200 "
