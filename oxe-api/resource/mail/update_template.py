from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_jwt_extended import jwt_required
from flask_restful import Resource
from webargs import fields
from sqlalchemy.orm.exc import NoResultFound

from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access


class UpdateTemplate(MethodResource, Resource):

    def __init__(self, db):
        self.db = db

    @log_request
    @doc(tags=['mail'],
         description='Save the HTML content of the specified email template (account_creation, '
                     'password_reset or request_notification)',
         responses={
             "200": {},
             "404": {"description": "This email template does not exist"},
         })
    @use_kwargs({
        'name': fields.Str(),
        'content': fields.Str(),
    })
    @jwt_required
    @verify_admin_access
    @catch_exception
    def post(self, **kwargs):

        if kwargs['name'].upper() in ["ACCOUNT_CREATION", "PASSWORD_RESET", "REQUEST_NOTIFICATION"]:
            try:
                template = self.db.session \
                    .query(self.db.tables["EmailTemplate"]) \
                    .filter(self.db.tables["EmailTemplate"].name == kwargs["name"]) \
                    .one()
                template.content = kwargs["content"]
                self.db.session.commit()
            except NoResultFound:
                self.db.insert(kwargs, self.db.tables["EmailTemplate"])
        else:
            return "", "404 This email template does not exist"

        return "", "200 "
