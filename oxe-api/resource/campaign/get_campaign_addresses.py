from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_jwt_extended import jwt_required
from flask_restful import Resource
from webargs import fields

from db.db import DB
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from utils.serializer import Serializer


class GetCampaignAddresses(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @doc(tags=['campaign'],
         description='Get addresses of a campaign specified by its ID',
         responses={
             "200": {},
         })
    @use_kwargs({
        'campaign_id': fields.Int(),
    }, location="query")
    @jwt_required
    @catch_exception
    def get(self, **kwargs):

        campaigns = self.db.get(self.db.tables["Campaign"], {"id": kwargs["campaign_id"]})

        if len(campaigns) == 0:
            return "", "422 Provided campaign does not exist"

        address_objects = self.db.get(self.db.tables["CampaignAddress"], {"campaign_id": kwargs["campaign_id"]})
        data = Serializer.serialize(address_objects, self.db.tables["CampaignAddress"])

        return data, "200 "
