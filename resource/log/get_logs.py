from flask_restful import Resource
from flask_apispec import MethodResource
from flask_jwt_extended import jwt_required
from webargs import fields, validate
from flask_apispec import use_kwargs, doc, marshal_with
from db.db import DB
from decorator.verify_admin_access import verify_admin_access
from utils.serializer import Serializer
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request


class GetLogs(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @doc(tags=['log'], description='Get logs of the API requests')
    @use_kwargs({
        'page': fields.Int(required=False, missing=1, validate=validate.Range(min=1)),
        'per_page': fields.Int(required=False, missing=50, validate=validate.Range(min=1, max=50)),
        'resource': fields.Str(required=False),
        'order': fields.Str(required=False, missing='desc', validate=lambda x: x in ['desc', 'asc']),
    })
    @marshal_with(None, code=200)
    @jwt_required
    @verify_admin_access
    @catch_exception
    def get(self, **kwargs):

        query = self.db.session.query(self.db.tables["Log"])

        if "resource" in kwargs and isinstance(kwargs["resource"], str):
            query = query.filter(self.db.tables["Log"].request.like(f"%{kwargs['resource']}%"))

        if "order" in kwargs and kwargs["order"] == "desc":
            query = query.order_by(self.db.tables["Log"].sys_date.desc())
        else:
            query = query.order_by(self.db.tables["Log"].sys_date.asc())

        pagination = query.paginate(kwargs["page"], kwargs["per_page"])
        logs = Serializer.serialize(pagination.items, self.db.tables["Log"])

        return {
            "pagination": {
                "page": kwargs["page"],
                "pages": pagination.pages,
                "per_page": kwargs["per_page"],
                "total": pagination.total,
            },
            "items": logs,
        }, "200 "
