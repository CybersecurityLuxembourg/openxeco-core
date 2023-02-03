from flask import request
from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_jwt_extended import fresh_jwt_required
from flask_restful import Resource
from webargs import fields
from sqlalchemy.orm.exc import NoResultFound
import datetime

from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access
from utils.mail import send_email
from utils.campaign import build_body
from exception.object_not_found import ObjectNotFound


class SendCampaign(MethodResource, Resource):

    def __init__(self, db, mail):
        self.db = db
        self.mail = mail

    @log_request
    @doc(tags=['campaign'],
         description='Send a mail to a list of email addresses as BCCs. The recipients cannot see each others address. '
                     'The information is stored in the "Campaign" and the "CampaignAddress tables. '
                     'The status of the campaign should be the following: DRAFT.',
         responses={
             "200": {},
             "422.a": {"description": "Object not found : Campaign"},
             "422.b": {"description": "Cannot process a campaign without the status 'DRAFT'"},
             "422.c": {"description": "Cannot process a campaign with an empty body"},
             "422.d": {"description": "Cannot process a campaign without address"},
             "422.e": {"description": "Cannot process a campaign with a template with empty content"},
             "422.f": {"description": "Cannot process a campaign with a template without [CAMPAIGN CONTENT] tag"},
         })
    @use_kwargs({
        'id': fields.Int(),
    })
    @fresh_jwt_required
    @verify_admin_access
    @catch_exception
    def post(self, **kwargs):

        # Verify campaign

        try:
            campaign = self.db.session \
                .query(self.db.tables["Campaign"]) \
                .filter(self.db.tables["Campaign"].id == kwargs["id"]) \
                .one()
        except NoResultFound:
            raise ObjectNotFound("Campaign")

        if campaign.status != "DRAFT":
            return "", "422 Cannot process a campaign without the status 'DRAFT'"

        if campaign.body is None:
            return "", "422 Cannot process a campaign with an empty body"

        # Verify addresses

        addresses = self.db.session \
            .query(self.db.tables["CampaignAddress"]) \
            .filter(self.db.tables["CampaignAddress"].campaign_id == kwargs["id"]) \
            .filter(self.db.tables["CampaignAddress"].value.isnot(None)) \
            .all()

        if len(addresses) == 0:
            return "", "422 Cannot process a campaign without address"

        # Build body

        template = None

        if campaign.template_id is not None:
            template = self.db.session \
                .query(self.db.tables["CampaignTemplate"]) \
                .filter(self.db.tables["CampaignTemplate"].id == campaign.template_id) \
                .one()

            if template.content is None:
                return "", "422 Cannot process a campaign with a template with empty content"
            if "[CAMPAIGN CONTENT]" not in template.content:
                return "", "422 Cannot process a campaign with a template without [CAMPAIGN CONTENT] tag"

        body = build_body(self.db, campaign, template, request.url_root)

        # Send campaign

        # TODO Consider [UNSUBSCRIPTION LINK]

        send_email(
            self.mail,
            recipients=[],
            bcc=[a.value for a in addresses],
            subject=campaign.subject,
            html_body=body
        )

        # Close campaign

        campaign.status = "PROCESSED"
        campaign.execution_date = datetime.datetime.now()

        self.db.session.commit()

        return "", "200 "
