from flask import request, render_template
from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_bcrypt import generate_password_hash
from flask_restful import Resource
from sqlalchemy.exc import IntegrityError
from webargs import fields

from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from exception.object_already_existing import ObjectAlreadyExisting
from utils.mail import send_email
from utils.password import generate_password
from utils.re import has_mail_format


class CreateAccount(MethodResource, Resource):

    db = None
    mail = None

    def __init__(self, db, mail):
        self.db = db
        self.mail = mail

    @log_request
    @doc(tags=['account'],
         description='Create an account with the provided email as a user ID',
         responses={
             "200": {},
             "422.a": {"description": "The provided email does not have the right format"},
             "422.b": {"description": "An account already exists with this email address"},
             "422.c": {"description": "Object already existing"},
             "500": {"description": "Impossible to find the origin. Please contact the administrator"},
         })
    @use_kwargs({
        'email': fields.Str(),
        'company': fields.Str(required=False, allow_none=True),
        'department': fields.Str(required=False, allow_none=True),
    })
    @catch_exception
    def post(self, **kwargs):

        email = kwargs["email"].lower()

        if 'HTTP_ORIGIN' in request.environ and request.environ['HTTP_ORIGIN']:
            origin = request.environ['HTTP_ORIGIN']
        else:
            return "", "500 Impossible to find the origin. Please contact the administrator"

        if not has_mail_format(email):
            return "", "422 The provided email does not have the right format"

        data = self.db.get(self.db.tables["User"], {"email": email})

        if len(data) > 0:
            return "", "422 An account already exists with this email address"

        generated_password = generate_password()

        user = {
            "email": email,
            "password": generate_password_hash(generated_password),
            "is_active": 1,
            "company_on_subscription": kwargs["company"] if "company" in kwargs else None,
            "department_on_subscription": kwargs["department"] if "department" in kwargs else None,
        }

        try:
            self.db.insert(user, self.db.tables["User"])
        except IntegrityError as e:
            self.db.session.rollback()
            if "Duplicate entry" in str(e):
                raise ObjectAlreadyExisting
            raise e

        send_email(self.mail,
                   subject='[CYBERSECURITY LUXEMBOURG] New account',
                   recipients=[email],
                   html_body=render_template('new_account.html', url=origin + "/login", password=generated_password))

        return "", "200 "
