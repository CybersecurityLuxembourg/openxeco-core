from flask_restful import Resource
from flask import request, render_template
from flask_jwt_extended import jwt_required
from flask_bcrypt import generate_password_hash
from sqlalchemy.exc import IntegrityError
from utils.re import has_mail_format, has_password_format
from utils.mail import send_email
# TODO: Needed?
#from config.config import FRONTEND_URL
from decorator.verify_payload import verify_payload
from decorator.verify_admin_access import verify_admin_access
from decorator.catch_exception import catch_exception
from exception.object_already_existing import ObjectAlreadyExisting
from decorator.log_request import log_request


class AddUser(Resource):

    db = None
    mail = None

    def __init__(self, db, mail):
        self.db = db
        self.mail = mail

    @log_request
    @verify_payload([
        {'field': 'email', 'type': str},
        {'field': 'password', 'type': str}
    ])
    @jwt_required
    @verify_admin_access
    @catch_exception
    def post(self):
        input_data = request.get_json()

        if 'HTTP_ORIGIN' in request.environ and request.environ['HTTP_ORIGIN']:
            origin = request.environ['HTTP_ORIGIN']
        else:
            return "", "500 Impossible to find the origin. Please contact the administrator"

        if not has_mail_format(input_data["email"]):
            return "", "422 The email does not have the right format"

        if not has_password_format(input_data["password"]):
            return "", "422 The password does not have the right format"

        old_password = input_data["password"]
        input_data["email"] = input_data["email"].lower()
        input_data["password"] = generate_password_hash(input_data["password"])

        try:
            self.db.insert(input_data, self.db.tables["User"])
        except IntegrityError as e:
            self.db.session.rollback()
            if "Duplicate entry" in str(e):
                raise ObjectAlreadyExisting
            raise e

        send_email(self.mail,
                   subject='[CYBERSECURITY LUXEMBOURG] New account',
                   recipients=[input_data["email"]],
                   html_body=render_template('new_account.html', url=origin, password=old_password))

        return "", "200 "
