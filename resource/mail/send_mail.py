from flask import request
from flask_apispec import MethodResource
from flask_jwt_extended import get_jwt_identity
from flask_jwt_extended import jwt_required
from flask_restful import Resource

from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access
from decorator.verify_payload import verify_payload
from utils.mail import send_email
from utils.re import has_mail_format


class SendMail(MethodResource, Resource):

    def __init__(self, db, mail):
        self.db = db
        self.mail = mail

    @log_request
    @verify_payload([
        {'field': 'subject', 'type': str},
        {'field': 'address', 'type': str},
        {'field': 'content', 'type': str},
        {'field': 'user_as_cc', 'type': bool, 'nullable': False, 'optional': True}
    ])
    @jwt_required
    @verify_admin_access
    @catch_exception
    def post(self):
        input_data = request.get_json()

        cc = None

        if 'user_as_cc' in input_data and input_data['user_as_cc'] is True:

            data = self.db.get(self.db.tables["User"], {"id": get_jwt_identity()})

            if len(data) < 1:
                return "", "500 The user has not been found"

            if data[0].email is None or not has_mail_format(data[0].email):
                return "", "500 The user does not have a correct email address"

            cc = [data[0].email]

        send_email(self.mail,
                   subject=input_data["subject"],
                   recipients=[input_data["address"]],
                   cc=cc,
                   html_body=input_data["content"])

        return "", "200 "
