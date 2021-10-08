from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_jwt_extended import jwt_required
from flask_restful import Resource
from sqlalchemy.exc import IntegrityError
from webargs import fields

from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access


class UpdateTaxonomyCategory(MethodResource, Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @doc(tags=['taxonomy'],
         description='Update a taxonomy category',
         responses={
             "200": {},
         })
    @use_kwargs({
        'name': fields.Str(),
        'active_on_companies': fields.Bool(required=False),
        'active_on_articles': fields.Bool(required=False),
        'accepted_article_types': fields.Bool(required=False, allow_none=True),
        'is_standard': fields.Bool(required=False),
    })
    @jwt_required
    @verify_admin_access
    @catch_exception
    def post(self, **kwargs):

        self.db.merge(kwargs, self.db.tables["TaxonomyCategory"])

        return "", "200 "
