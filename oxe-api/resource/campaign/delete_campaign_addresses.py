from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_jwt_extended import jwt_required
from flask_restful import Resource
from webargs import fields
from sqlalchemy.orm.exc import NoResultFound

from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access
from exception.object_not_found import ObjectNotFound


class DeleteCampaignAddresses(MethodResource, Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @doc(tags=['campaign'],
         description='Delete addresses related to campaigns',
         responses={
             "200": {},
             "422.b": {"description": "Cannot modify a campaign that does not have the 'DRAFT' status"},
         })
    @use_kwargs({
        'ids': fields.List(fields.Int()),
    })
    @jwt_required
    @verify_admin_access
    @catch_exception
    def post(self, **kwargs):

        # Checking campaign

        address_query = self.db.session \
            .query(self.db.tables["CampaignAddress"]) \
            .filter(self.db.tables["CampaignAddress"].id.in_(kwargs["ids"]))
        addresses = address_query.all()

        campaign = self.db.session \
            .query(self.db.tables["Campaign"]) \
            .filter(self.db.tables["Campaign"].id.in_([a.campaign_id for a in addresses])) \
            .filter(self.db.tables["Campaign"].status != "DRAFT") \
            .all()

        if len(campaign) > 0:
            return "", "422 Cannot modify a campaign that does not have the 'DRAFT' status"

        # proceed

        count = address_query.delete(synchronize_session=False)

        return "", f"200 {count} address{'es' if count > 1 else ''} deleted"
