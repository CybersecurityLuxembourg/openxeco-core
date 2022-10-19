import json
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
from utils.re import has_mail_format
from utils.token import generate_confirmation_token

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
        'password': fields.Str(),
        'entity': fields.Str(required=False, allow_none=True),
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

        # Create user

        password = kwargs["password"]

        try:
            user = self.db.insert({
                "email": email,
                "password": generate_password_hash(password),
                "is_active": 0,
            }, self.db.tables["User"])
        except IntegrityError as e:
            if "Duplicate entry" in str(e):
                raise ObjectAlreadyExisting
            raise e

        try:
            self.db.insert({
                "entity_type": "User",
                "entity_id": user.id,
                "action": "Create User Account",
                "values_before": "{}",
                "values_after": json.dumps({
                    "id": user.id,
                    "email": user.email,
                }),
                "user_id": user.id,
            }, self.db.tables["AuditRecord"])
        except Exception as err:
            # We don't want the app to error if we can't log the action
            print(err)
        # Send email
        token = generate_confirmation_token(user.email)
        try:
            url = f"{origin}/login?action=verify_account&token={token}"
            send_email(self.mail,
                subject=f"New account",
                recipients=[email],
                html_body=render_template(
                    'new_account.html',
                    email=user.email,
                    url=url,
                )
            )
        except Exception as e:
            self.db.session.rollback()
            self.db.delete(self.db.tables["User"], {"id": user.id})
            raise e

        return "", "200"
