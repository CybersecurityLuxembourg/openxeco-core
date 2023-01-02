from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_jwt_extended import get_jwt_identity
from flask_jwt_extended import jwt_required
from flask_restful import Resource
from webargs import fields

from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access
from utils.mail import send_email
from utils.re import has_mail_format


class SendMail(MethodResource, Resource):

    def __init__(self, db, mail):
        self.db = db
        self.mail = mail

    @log_request
    @doc(tags=['mail'],
         description='Save the HTML content of the specified mail template name (account_creation or password_reset)',
         responses={
             "200": {},
             "404": {"description": "This mail template does not exist"},
         })
    @use_kwargs({
        'subject': fields.Str(),
        'address': fields.Str(),
        'content': fields.Str(),
        'user_as_cc': fields.Bool(required=False, allow_none=True),
    })
    @jwt_required
    @verify_admin_access
    @catch_exception
    def post(self, **kwargs):

        cc = None

        if 'user_as_cc' in kwargs and kwargs['user_as_cc'] is True:
            data = self.db.get(self.db.tables["User"], {"id": get_jwt_identity()})

            if len(data) < 1:
                return "", "500 The user has not been found"

            if data[0].email is None or not has_mail_format(data[0].email):
                return "", "500 The user does not have a correct email address"

            cc = [data[0].email]

        send_email(self.mail,
                   subject=kwargs["subject"],
                   recipients=[kwargs["address"]],
                   cc=cc,
                   html_body=kwargs["content"])

        return "", "200 "
