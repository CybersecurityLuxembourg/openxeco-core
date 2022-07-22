from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_jwt_extended import jwt_required
from flask_restful import Resource
from webargs import fields

from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access


class UpdateCompany(MethodResource, Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @doc(tags=['company'],
         description='Update a company specified by its ID',
         responses={
             "200": {},
         })
    @use_kwargs({
        'id': fields.Int(),
        'trade_register_number': fields.Str(required=False, allow_none=True),
        'name': fields.Str(required=False, allow_none=True),
        'image': fields.Int(required=False, allow_none=True),
        'description': fields.Str(required=False, allow_none=True),
        'creation_date': fields.Str(required=False, allow_none=True),
        'website': fields.Str(required=False, allow_none=True),
        'is_startup': fields.Bool(required=False),
        'is_cybersecurity_core_business': fields.Bool(required=False),
        'status': fields.Str(required=False, validate=lambda x: x in ['ACTIVE', 'INACTIVE', 'DELETED']),
        'legal_status': fields.Str(required=False,
                                   validate=lambda x: x in ['JURIDICAL PERSON', 'NATURAL PERSON', 'OTHER']),
        'linkedin_url': fields.Str(required=False, allow_none=True),
        'twitter_url': fields.Str(required=False, allow_none=True),
        'youtube_url': fields.Str(required=False, allow_none=True),
        'discord_url': fields.Str(required=False, allow_none=True),
    })
    @jwt_required
    @verify_admin_access
    @catch_exception
    def post(self, **kwargs):

        self.db.merge(kwargs, self.db.tables["Company"])

        return "", "200 "
