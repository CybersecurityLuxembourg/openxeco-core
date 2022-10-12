from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_jwt_extended import jwt_required
from flask_restful import Resource
from webargs import fields

from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access
from utils.mail import send_email


class SendCommunication(MethodResource, Resource):

    def __init__(self, db, mail):
        self.db = db
        self.mail = mail

    @log_request
    @doc(tags=['mail'],
         description='Send a mail to a list of email addresses as BCCs. The recipients cannot see each others address. '
                     'The information is stored in the "Communication" table.',
         responses={
             "200": {},
         })
    @use_kwargs({
        'addresses': fields.List(fields.Str()),
        'subject': fields.Str(),
        'body': fields.Str(),
    })
    @jwt_required
    @verify_admin_access
    @catch_exception
    def post(self, **kwargs):

        self.db.insert({
            "addresses": ",".join(kwargs["addresses"]),
            "subject": kwargs["subject"],
            "body": kwargs["body"],
            "status": "ACCEPTED",
        }, self.db.tables["Communication"], commit=False)

        send_email(self.mail,
                   recipients="",
                   bcc=kwargs["addresses"],
                   subject=kwargs["subject"],
                   html_body=kwargs["body"])

        self.db.session.commit()

        return "", "200 "
