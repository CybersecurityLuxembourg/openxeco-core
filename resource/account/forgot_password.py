from flask import request, render_template
from flask_jwt_extended import create_access_token
from flask_restful import Resource
import datetime
from utils.mail import send_email
from config.config import FRONTEND_URL
from decorator.verify_payload import verify_payload
from decorator.verify_admin_access import verify_admin_access
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request


class ForgotPassword(Resource):

    db = None
    mail = None

    def __init__(self, db, mail):
        self.db = db
        self.mail = mail

    @log_request
    @catch_exception
    @verify_payload(format=[
        {'field': 'email', 'type': str}
    ])
    def post(self):
        input_data = request.get_json()

        data = self.db.get(self.db.tables["User"], {"email": input_data["email"]})

        if len(data) < 1:
            return "", "500 The user has not been found"

        user = data[0]
        expires = datetime.timedelta(minutes=15)
        reset_token = create_access_token(str(user.id), expires_delta=expires)
        url = f"{FRONTEND_URL}?action=reset_password&token={reset_token}"

        send_email(self.mail,
                   subject='[CY-DB] Reset Your Password',
                   recipients=[user.email],
                   html_body=render_template('reset_password.html', url=url))

        return "", "200 "
