from flask import request, render_template
from flask_jwt_extended import create_access_token
from flask_restful import Resource
from flask_apispec import MethodResource
import datetime
from utils.mail import send_email
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from webargs import fields
from flask_apispec import use_kwargs, doc


class ForgotPassword(MethodResource, Resource):

    db = None
    mail = None

    def __init__(self, db, mail):
        self.db = db
        self.mail = mail

    @log_request
    @doc(tags=['account'],
         description='Request a password change with a temporary link sent via email',
         responses={
             "200": {},
             "500.a": {"description": "Impossible to find the origin. Please contact the administrator"},
             "500.b": {"description": "The user has not been found"},
         })
    @use_kwargs({
        'email': fields.Str(),
    })
    @catch_exception
    def post(self, **kwargs):

        if 'HTTP_ORIGIN' in request.environ and request.environ['HTTP_ORIGIN']:
            origin = request.environ['HTTP_ORIGIN']
        else:
            return "", "500 Impossible to find the origin. Please contact the administrator"

        data = self.db.get(self.db.tables["User"], {"email": kwargs["email"]})

        if len(data) < 1:
            return "", "500 The user has not been found"

        user = data[0]
        expires = datetime.timedelta(minutes=15)
        reset_token = create_access_token(str(user.id), expires_delta=expires)
        url = f"{origin}/login?action=reset_password&token={reset_token}"

        send_email(self.mail,
                   subject='[CYBERSECURITY LUXEMBOURG] Reset Your Password',
                   recipients=[user.email],
                   html_body=render_template('reset_password.html', url=url))

        return "", "200 "
