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

        # Create the entity request if filled
        # if "entity" in kwargs and kwargs["entity"] is not None \
        #    and "department" in kwargs and kwargs["department"] is not None:
        #     try:
        #         self.db.insert({
        #             "user_id": user.id,
        #             "request": "The user requests the access to the entity '"
        #                        + kwargs["entity"]
        #                        + "' with the following department: '"
        #                        + kwargs["department"]
        #                        + "'",
        #             "type": "ENTITY ACCESS CLAIM",
        #         }, self.db.tables["UserRequest"])
        #     except IntegrityError as e:
        #         self.db.session.rollback()
        #         self.db.delete(self.db.tables["User"], {"id": user.id})
        #         raise e

        # Send email
        token = generate_confirmation_token(user.email)
        try:
            pj_settings = self.db.get(self.db.tables["Setting"], {"property": "PROJECT_NAME"})
            project_name = pj_settings[0].value if len(pj_settings) > 0 else ""
            url = f"{origin}/login?action=verify_account&token={token}"
            send_email(self.mail,
                       subject=f"[{project_name}] New account",
                       recipients=[email],
                       html_body=render_template(
                           'new_account.html',
                           first_name=user.first_name,
                           url=url,
                           project_name=project_name)
                       )
        except Exception as e:
            self.db.session.rollback()
            self.db.delete(self.db.tables["User"], {"id": user.id})
            raise e

        return "", "200"
