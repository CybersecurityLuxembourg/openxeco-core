from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_jwt_extended import jwt_required
from flask_restful import Resource
from webargs import fields, validate

from db.db import DB
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access
from utils.serializer import Serializer


class GetForms(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @doc(tags=['form'],
         description='Get the forms',
         responses={
             "200": {},
         })
    @use_kwargs({
        'page': fields.Int(required=False, missing=1, validate=validate.Range(min=1)),
        'per_page': fields.Int(required=False, missing=50, validate=validate.Range(min=1, max=50)),
    }, location="query")
    @jwt_required
    @verify_admin_access
    @catch_exception
    def get(self, **kwargs):

        query = self.db.session.query(self.db.tables["Form"])
        paginate = query.paginate(kwargs["page"], kwargs["per_page"])
        forms = Serializer.serialize(paginate.items, self.db.tables["Form"])

        return {
            "pagination": {
                "page": kwargs["page"],
                "pages": paginate.pages,
                "per_page": kwargs["per_page"],
                "total": paginate.total,
            },
            "items": forms,
        }
