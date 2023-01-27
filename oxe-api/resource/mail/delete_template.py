from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_jwt_extended import jwt_required
from flask_restful import Resource
from webargs import fields
from sqlalchemy.orm.exc import NoResultFound

from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access


class DeleteTemplate(MethodResource, Resource):

    def __init__(self, db):
        self.db = db

    @log_request
    @doc(tags=['mail'],
         description='Save the HTML content of the specified email template (account_creation, '
                     'password_reset or request_notification)',
         responses={
             "200": {},
             "404": {"description": "This email template does not exist"},
             "422": {"description": "This email template exists but has no content defined"},
         })
    @use_kwargs({
        'name': fields.Str(),
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
                self.db.session.delete(template)
                self.db.session.commit()
            except NoResultFound:
                return "", "422 This email template exists but has no content defined"
        else:
            return "", "404 This email template does not exist"

        return "", "200 "
