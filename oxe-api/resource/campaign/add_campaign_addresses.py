from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_jwt_extended import fresh_jwt_required
from flask_restful import Resource
from webargs import fields
from sqlalchemy.orm.exc import NoResultFound

from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access
from utils.regex import has_mail_format
from exception.object_not_found import ObjectNotFound


class AddCampaignAddresses(MethodResource, Resource):

    def __init__(self, db):
        self.db = db

    @log_request
    @doc(tags=['campaign'],
         description='Add addresses related to a campaign',
         responses={
             "200": {},
             "422.a": {"description": "Object not found: Campaign"},
             "422.b": {"description": "Cannot modify a campaign that does not have the 'DRAFT' status"},
         })
    @use_kwargs({
        'campaign_id': fields.Int(),
        'addresses': fields.List(fields.Str()),
    })
    @fresh_jwt_required
    @verify_admin_access
    @catch_exception
    def post(self, **kwargs):

        # Checking campaign

        try:
            campaign = self.db.session \
                .query(self.db.tables["Campaign"]) \
                .filter(self.db.tables["Campaign"].id == kwargs["campaign_id"]) \
                .one()
        except NoResultFound:
            raise ObjectNotFound("Campaign")

        if campaign.status != "DRAFT":
            return "", "422 Cannot modify a campaign that does not have the 'DRAFT' status"

        # Insert

        self.db.insert(
            [{"campaign_id": kwargs["campaign_id"], "value": a} for a in kwargs["addresses"] if has_mail_format(a)],
            self.db.tables["CampaignAddress"]
        )

        return "", "200 "
