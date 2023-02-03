from flask_apispec import MethodResource
from flask_apispec import doc
from flask_jwt_extended import fresh_jwt_required
from flask_restful import Resource
from decorator.verify_admin_access import verify_admin_access

from db.db import DB
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from utils.serializer import Serializer


class GetCampaignTemplates(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @doc(tags=['campaign'],
         description='Get campaign templates',
         responses={
             "200": {},
         })
    @fresh_jwt_required
    @verify_admin_access
    @catch_exception
    def get(self):

        template_objects = self.db.get(self.db.tables["CampaignTemplate"])
        data = Serializer.serialize(template_objects, self.db.tables["CampaignTemplate"])

        return data, "200 "
