from flask import request, render_template
from flask_apispec import MethodResource
from flask_apispec import doc
from flask_restful import Resource
from itsdangerous.exc import SignatureExpired, BadSignature

from decorator.catch_exception import catch_exception
from utils.mail import send_email
from utils.token import confirm_token

class VerifyAccount(MethodResource, Resource):

    db = None
    mail = None

    def __init__(self, db, mail):
        self.db = db
        self.mail = mail

    @doc(tags=['account'],
         description='Verify new account using given token',
         responses={
             "200": {},
             "422.a": {"description": "The verification link is invalid"},
             "422.b": {"description": "The verification link has expired"},
         })
    @catch_exception
    def get(self, token):

        if 'HTTP_ORIGIN' in request.environ and request.environ['HTTP_ORIGIN']:
            origin = request.environ['HTTP_ORIGIN']
        else:
            return "", "500 Impossible to find the origin. Please contact the administrator"

        # Verify token
        try:
            email = confirm_token(token)
        except BadSignature:
            return "", "422 The verification link is invalid."
        except SignatureExpired:
            return "", "422 The verification link has expired."

        # Set user to active
        data = self.db.get(self.db.tables["User"], {"email": email})
        user = data[0]
        if user.is_active:
            return "", "422 The verification link is invalid."
        user.is_active = 1
        self.db.merge(user, self.db.tables["User"])

        # Send email
        try:
            pj_settings = self.db.get(self.db.tables["Setting"], {"property": "PROJECT_NAME"})
            project_name = pj_settings[0].value if len(pj_settings) > 0 else ""

            send_email(self.mail,
                       subject=f"[{project_name}] Account verified",
                       recipients=[email],
                       html_body=render_template(
                           'account_verified.html',
                           first_name=user.first_name,
                           url=f"{origin}/login",
                           project_name=project_name)
                       )
        except Exception as e:
            pass

        return "", "200"