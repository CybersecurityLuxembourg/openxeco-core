from flask_restful import Resource
from flask_apispec import MethodResource
from flask import request, render_template
from flask_jwt_extended import jwt_required
from flask_bcrypt import generate_password_hash
from utils.re import has_mail_format, has_password_format
from utils.mail import send_email
from decorator.verify_admin_access import verify_admin_access
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from webargs import fields
from flask_apispec import use_kwargs, doc


class AddUser(MethodResource, Resource):

    db = None
    mail = None

    def __init__(self, db, mail):
        self.db = db
        self.mail = mail

    @log_request
    @doc(tags=['user'],
         description='Add a user',
         responses={
             "200": {},
             "422.a": {"description": "The email does not have the right format"},
             "422.b": {"description": "The password does not have the right format"},
             "422.c": {"description": "This user is already existing"},
             "500": {"description": "Impossible to find the origin. Please contact the administrator"},
         })
    @use_kwargs({
        'email': fields.Str(),
        'password': fields.Str(),
    })
    @jwt_required
    @verify_admin_access
    @catch_exception
    def post(self, **kwargs):

        if 'HTTP_ORIGIN' in request.environ and request.environ['HTTP_ORIGIN']:
            origin = request.environ['HTTP_ORIGIN']
        else:
            return "", "500 Impossible to find the origin. Please contact the administrator"

        if not has_mail_format(kwargs["email"]):
            return "", "422 The email does not have the right format"

        if not has_password_format(kwargs["password"]):
            return "", "422 The password does not have the right format"

        old_password = kwargs["password"]
        kwargs["email"] = kwargs["email"].lower()
        kwargs["password"] = generate_password_hash(kwargs["password"])

        try:
            self.db.insert(kwargs, self.db.tables["User"])
        except Exception as e:
            self.db.session.rollback()
            if "Duplicate entry" in str(e):
                return "", "422 This user is already existing"
            raise

        send_email(self.mail,
                   subject='[CYBERSECURITY LUXEMBOURG] New account',
                   recipients=[kwargs["email"]],
                   html_body=render_template('new_account.html', url=origin, password=old_password))

        return "", "200 "
