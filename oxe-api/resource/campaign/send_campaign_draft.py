from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_restful import Resource
from webargs import fields
from sqlalchemy.orm.exc import NoResultFound

from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access
from utils.mail import send_email
from utils.campaign import build_body, manage_unsubscription_link
from exception.object_not_found import ObjectNotFound


class SendCampaignDraft(MethodResource, Resource):

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
             "401": {"description": "The user has not been found"},
             "422.a": {"description": "Object not found : Campaign"},
             "422.b": {"description": "Cannot process a campaign draft without the status 'DRAFT'"},
             "422.c": {"description": "Cannot process a campaign draft with an empty body"},
             "422.e": {"description": "Cannot process a campaign with a template with empty content"},
             "422.f": {"description": "Cannot process a campaign with a template without [CAMPAIGN CONTENT] tag"},
         })
    @use_kwargs({
        'id': fields.Int(),
    })
    @jwt_required
    @verify_admin_access
    @catch_exception
    def post(self, **kwargs):

        # Get user address

        user = self.db.get(self.db.tables["User"], {"id": get_jwt_identity()})

        if len(user) == 0:
            return "", "401 The user has not been found"

        user = user[0]

        # Verify campaign

        try:
            campaign = self.db.session \
                .query(self.db.tables["Campaign"]) \
                .filter(self.db.tables["Campaign"].id == kwargs["id"]) \
                .one()
        except NoResultFound:
            raise ObjectNotFound("Campaign")

        if campaign.status != "DRAFT":
            return "", "422 Cannot process a campaign draft without the status 'DRAFT'"

        if campaign.body is None:
            return "", "422 Cannot process a campaign draft with an empty body"

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

        body = build_body(self.db, campaign, template)
        body = manage_unsubscription_link(body, get_jwt_identity())

        # Send campaign

        send_email(
            self.mail,
            recipients=[user.email],
            subject="[DRAFT] " + campaign.subject,
            html_body=body
        )

        return "", "200 "
