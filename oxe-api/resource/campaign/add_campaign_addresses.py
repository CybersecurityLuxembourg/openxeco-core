from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_jwt_extended import jwt_required
from flask_restful import Resource
from webargs import fields

from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access


class AddCampaignAddresses(MethodResource, Resource):

    def __init__(self, db):
        self.db = db

    @log_request
    @doc(tags=['contact'],
         description='Add addresses related to a campaign',
         responses={
             "200": {},
             "422": {"description": "Provided campaign does not exist"},
         })
    @use_kwargs({
        'campaign_id': fields.Int(),
        'addresses': fields.List(fields.Str()),
    })
    @jwt_required
    @verify_admin_access
    @catch_exception
    def post(self, **kwargs):

        # Checking campaign

        entity = self.db.get(self.db.tables["Campaign"], {"id": kwargs["campaign_id"]})

        if len(entity) == 0:
            return "", "422 Provided campaign does not exist"

        # Insert
        # TODO check address format
        self.db.insert(kwargs, self.db.tables["CampaignAddress"])

        return "", "200 "
