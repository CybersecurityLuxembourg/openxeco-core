from flask_apispec import MethodResource
from flask_apispec import doc
from flask_jwt_extended import fresh_jwt_required
from flask_restful import Resource

from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access


class AddCampaign(MethodResource, Resource):

    def __init__(self, db):
        self.db = db

    @log_request
    @doc(tags=['campaign'],
         description='Add a campaign',
         responses={
             "200": {},
         })
    @fresh_jwt_required
    @verify_admin_access
    @catch_exception
    def post(self):

        campaign = self.db.insert({}, self.db.tables["Campaign"])

        return campaign.id, "200 "
