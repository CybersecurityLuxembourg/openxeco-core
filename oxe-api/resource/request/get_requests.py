from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_jwt_extended import fresh_jwt_required
from flask_restful import Resource
from webargs import fields, validate

from db.db import DB
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access
from utils.serializer import Serializer


class GetRequests(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @doc(tags=['request'],
         description='Get the requests',
         responses={
             "200": {},
         })
    @use_kwargs({
        'page': fields.Int(required=False, missing=1, validate=validate.Range(min=1)),
        'per_page': fields.Int(required=False, missing=50, validate=validate.Range(min=1, max=50)),
        'order': fields.Str(required=False, missing='desc', validate=lambda x: x in ['desc', 'asc']),
        'status': fields.DelimitedList(fields.Str(), required=False),
    }, location="query")
    @fresh_jwt_required
    @verify_admin_access
    @catch_exception
    def get(self, **kwargs):

        query = self.db.session.query(self.db.tables["UserRequest"])

        if "status" in kwargs:
            query = query.filter(self.db.tables["UserRequest"].status.in_(kwargs["status"]))

        if "order" in kwargs and kwargs["order"] == "desc":
            query = query.order_by(self.db.tables["UserRequest"].submission_date.desc())
        else:
            query = query.order_by(self.db.tables["UserRequest"].submission_date.asc())

        pagination = query.paginate(kwargs['page'], kwargs['per_page'])
        data = Serializer.serialize(pagination.items, self.db.tables["UserRequest"])

        return {
            "pagination": {
                "page": kwargs['page'],
                "pages": pagination.pages,
                "per_page": kwargs['per_page'],
                "total": pagination.total,
            },
            "items": data,
        }, "200 "
