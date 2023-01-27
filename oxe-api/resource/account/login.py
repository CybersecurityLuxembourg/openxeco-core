from datetime import datetime, timedelta

from flask import session, render_template
from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_bcrypt import check_password_hash
from flask_jwt_extended import create_access_token, create_refresh_token
from flask_restful import Resource
from utils.token import generate_otp, hash_otp
from utils.mail import send_email
from webargs import fields

from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from utils.cookie import set_cookie


class Login(MethodResource, Resource):

    db = None
    mail = None

    def __init__(self, db, mail):
        self.db = db
        self.mail = mail

    @log_request
    @doc(tags=['account'],
         description='Create an access and a refresh cookie by log in with an email and a password',
         responses={
             "200": {},
             "401.a": {"description": "Wrong email/password combination"},
             "401.b": {"description": "This account is not active. Please check your email for an activation link."},
         })
    @use_kwargs({
        'email': fields.Str(),
        'password': fields.Str(),
    })
    @catch_exception
    def post(self, **kwargs):

        data = self.db.get(self.db.tables["User"], {"email": kwargs["email"]})

        # If the user is not found, we simulate the whole process with a blank password.
        # This is done to limit the time discrepancy factor against the user enumeration exploit
        # CF: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html

        password = data[0].password if len(data) > 0 else "Imp0ssiblePassword~~"

        if not check_password_hash(password, kwargs['password']):
            return "", "401 Wrong email/password combination"

        if not data[0].is_active:
            return "", "401 This account is has been disabled."

        if not data[0].is_admin and data[0].status == "NEW":
            return "", "401 This account is not active. Please check your email for an activation link."

        # delete old otp if exists
        old_otp = self.db.get(self.db.tables["UserOtp"], {"user_id": data[0].id})
        if len(old_otp) > 0:
            self.db.delete(self.db.tables["UserOtp"], {"user_id": data[0].id})

        # create new otp
        otp = generate_otp()
        self.db.insert({
            "token":  hash_otp(otp),
            "user_id": data[0].id,
        }, self.db.tables["UserOtp"])

        # send otp to user
        send_email(self.mail,
            subject=f"Login One Time Pin",
            recipients=[kwargs["email"]],
            html_body=render_template(
                'login_otp.html',
                token=otp,
            )
        )

        # access_token_expires = datetime.timedelta(days=1)
        # refresh_token_expires = datetime.timedelta(days=365)
        # access_token = create_access_token(identity=str(data[0].id), expires_delta=access_token_expires)
        # refresh_token = create_refresh_token(identity=str(data[0].id), expires_delta=refresh_token_expires)

        return {}, "200 "
