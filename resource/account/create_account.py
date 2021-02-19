from flask import request, render_template
from flask_restful import Resource
from flask_bcrypt import generate_password_hash
from utils.password import generate_password
from flask_jwt_extended import jwt_required
from decorator.log_request import log_request
from decorator.verify_payload import verify_payload
from decorator.catch_exception import catch_exception
from utils.re import has_mail_format
from exception.object_already_existing import ObjectAlreadyExisting
from utils.mail import send_email
from sqlalchemy.exc import IntegrityError
from config.config import FRONTEND_URL


class CreateAccount(Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @catch_exception
    @verify_payload(format=[
        {'field': 'email', 'type': str},
    ])
    def post(self):
        input_data = request.get_json()

        if not has_mail_format(input_data["email"]):
            return "", "422 The provided email does not have the right format"

        data = self.db.get(self.db.tables["User"], {"email": input_data["email"]})

        if len(data) > 0:
            return "", "403 An account already exists with this email address"

        input_data["email"] = input_data["email"].lower()
        generated_password = generate_password()

        user = {
            "email": input_data["email"].lower(),
            "password": generate_password_hash(generated_password),
            "is_active": 1
        }

        try:
            self.db.insert(user, self.db.tables["User"])
        except IntegrityError as e:
            self.db.session.rollback()
            if "Duplicate entry" in str(e):
                raise ObjectAlreadyExisting
            else:
                raise e

        send_email(self.mail,
                   subject='[CYBERSECURITY LUXEMBOURG] New account',
                   recipients=[input_data["email"]],
                   html_body=render_template('new_account.html', url=FRONTEND_URL, password=generated_password))

        return "", "200 "
