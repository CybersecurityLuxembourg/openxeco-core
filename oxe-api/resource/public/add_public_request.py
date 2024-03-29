from flask import render_template
from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_restful import Resource
from webargs import fields
import json

from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from utils.mail import send_email
from utils.regex import has_mail_format
from utils.env import get_admin_portal_url


class AddPublicRequest(MethodResource, Resource):

    def __init__(self, db, mail):
        self.db = db
        self.mail = mail

    @log_request
    @doc(tags=['public'],
         description='Add a request via a non-authenticated process. This resource serves a solution for '
                     'public contact form. The message field is limited to 500 characters',
         responses={
             "200": {},
         })
    @use_kwargs({
        'full_name': fields.Str(required=False, allow_none=True),
        'email': fields.Str(required=True, allow_none=False, validate=lambda x: has_mail_format(x) is not None),
        'message': fields.Str(required=True, allow_none=False, validate=lambda x: x is not None and len(x) <= 500),
        'parameters': fields.Dict(required=False, allow_none=False, missing={}),
    })
    @catch_exception
    def post(self, **kwargs):

        # Build request

        r = dict()

        r["type"] = "CONTACT FORM"
        r["request"] = kwargs["message"]
        r["data"] = json.dumps({
            **kwargs["parameters"],
            **{
                "email": kwargs["email"],
                "full_name": kwargs["full_name"],
            },
        })

        # Insert request

        self.db.insert(r, self.db.tables["UserRequest"])

        # Send contact form notification email

        pj_settings = self.db.get(self.db.tables["Setting"], {"property": "PROJECT_NAME"})
        project_name = pj_settings[0].value if len(pj_settings) > 0 else ""

        send_email(self.mail,
                   subject=f"[{project_name}] New contact form submission",
                   recipients=[kwargs["email"]],
                   html_body=render_template(
                       'contact_form_notification.html',
                       url=get_admin_portal_url() + "/task?tab=request",
                       project_name=project_name)
                   )

        return "", "200 "
