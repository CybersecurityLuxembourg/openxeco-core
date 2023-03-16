from flask_apispec import MethodResource
from flask_apispec import doc
from flask_restful import Resource

from db.db import DB
from decorator.catch_exception import catch_exception
from utils.response import build_no_cors_response


class GetPublicNodeInformation(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @doc(tags=['public'],
         description='Get the global information of the node',
         responses={
             "200": {},
         })
    @catch_exception
    def get(self):

        settings = self.db.get(self.db.tables["Setting"])

        return build_no_cors_response({
            "project_name": GetPublicNodeInformation.get_config(settings, "PROJECT_NAME"),
            "email_address": GetPublicNodeInformation.get_config(settings, "EMAIL_ADDRESS"),
            "phone_number": GetPublicNodeInformation.get_config(settings, "PHONE_NUMBER"),
            "postal_address": GetPublicNodeInformation.get_config(settings, "POSTAL_ADDRESS"),
            "version": "v1.16",
        })

    @staticmethod
    def get_config(settings, setting_name):
        s = [s for s in settings if s.property == setting_name]

        if len(s) > 0:
            return s[0].value

        return None
