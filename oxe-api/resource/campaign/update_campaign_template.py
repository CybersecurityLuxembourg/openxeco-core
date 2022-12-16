from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_jwt_extended import jwt_required
from flask_restful import Resource
from webargs import fields

from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access


class UpdateCampaignTemplate(MethodResource, Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @doc(tags=['campaign'],
         description='Update a campaign template specified by its ID',
         responses={
             "200": {},
             "422": {"description": "Provided template does not exist"},
         })
    @use_kwargs({
        'id': fields.Int(),
        'name': fields.Str(required=False, allow_none=True),
        'content': fields.Str(required=False, allow_none=True),
    })
    @jwt_required
    @verify_admin_access
    @catch_exception
    def post(self, **kwargs):

        templates = self.db.get(self.db.tables["CampaignTemplate"], {"id": kwargs["id"]})

        if len(templates) == 0:
            return "", "422 Provided template does not exist"

        self.db.merge(kwargs, self.db.tables["CampaignTemplate"])

        return "", "200 "
