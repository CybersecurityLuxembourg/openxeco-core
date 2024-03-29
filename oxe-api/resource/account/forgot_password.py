import datetime

from flask import render_template
from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_jwt_extended import create_access_token
from flask_restful import Resource
from webargs import fields

from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from utils.mail import send_email
from utils.env import get_community_portal_url


class ForgotPassword(MethodResource, Resource):

    db = None
    mail = None

    def __init__(self, db, mail):
        self.db = db
        self.mail = mail

    @log_request
    @doc(tags=['account'],
         description='Request a password change with a temporary link sent via email. '
                     'The resource return a 200 response code for all inputs to avoid user enumeration exploit.',
         responses={
             "200": {},
         })
    @use_kwargs({
        'email': fields.Str(),
    })
    @catch_exception
    def post(self, **kwargs):

        # Build content

        # If the user is not found, we simulate the whole process with a blank user.
        # this is done to limit the time discrepancy factor against the user enumeration exploit
        # CF: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html

        data = self.db.get(self.db.tables["User"], {"email": kwargs["email"]})

        user = data[0] if len(data) > 0 else self.db.tables["User"](id=-1, email=kwargs["email"])
        expires = datetime.timedelta(minutes=15 if len(data) > 0 else 0)
        reset_token = create_access_token(str(user.id), expires_delta=expires, fresh=True)
        url = f"{get_community_portal_url()}/login?action=reset_password&token={reset_token}"

        pj_settings = self.db.get(self.db.tables["Setting"], {"property": "PROJECT_NAME"})
        project_name = pj_settings[0].value if len(pj_settings) > 0 else ""

        # Send email

        send_email(self.mail,
                   subject=f"[{project_name}] Reset Your Password",
                   recipients=[user.email],
                   html_body=render_template('password_reset.html', url=url, project_name=project_name))

        return "", "200 If that email address is in our database, we will send you an email to reset your password"
