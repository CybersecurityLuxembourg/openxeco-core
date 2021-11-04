from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_jwt_extended import jwt_required
from flask_restful import Resource
from webargs import fields, validate

from db.db import DB
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from utils.serializer import Serializer


class GetCommunications(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @doc(tags=['communication'],
         description='Get communications',
         responses={
             "200": {},
         })
    @use_kwargs({
        'page': fields.Int(required=False, missing=1, validate=validate.Range(min=1)),
        'per_page': fields.Int(required=False, missing=50, validate=validate.Range(min=1, max=50)),
    }, location="query")
    @jwt_required
    @catch_exception
    def get(self, **kwargs):

        query = self.session \
            .query(self.db.tables["Communication"]) \
            .order_by(self.tables["Communication"].id.desc())
        paginate = query.paginate(kwargs['page'], kwargs['per_page'])
        communications = Serializer.serialize(paginate.items, self.db.tables["Communication"])

        return {
            "pagination": {
                "page": kwargs['page'],
                "pages": paginate.pages,
                "per_page": kwargs['per_page'],
                "total": paginate.total,
            },
            "items": communications,
        }, "200 "
