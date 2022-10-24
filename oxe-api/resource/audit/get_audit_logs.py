from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_jwt_extended import jwt_required
from flask_restful import Resource
from webargs import fields, validate

from db.db import DB
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access


class GetAuditLogs(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @doc(tags=['audit'],
         description='Get paged audit logs',
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

        query = self.db.session.query(self.db.tables["AuditRecord"])\
            .with_entities(self.db.tables["AuditRecord"].timestamp,
                           self.db.tables["AuditRecord"].entity_type,
                           self.db.tables["AuditRecord"].entity_id,
                           self.db.tables["AuditRecord"].action,
                           self.db.tables["AuditRecord"].values_before,
                           self.db.tables["AuditRecord"].values_after,
                           self.db.tables["AuditRecord"].user_id) \
            .order_by(self.db.tables["AuditRecord"].timestamp.desc())

        paginate = query.paginate(kwargs['page'], kwargs['per_page'])
        logs = [l._asdict() for l in paginate.items]

        return {
            "pagination": {
                "page": kwargs['page'],
                "pages": paginate.pages,
                "per_page": kwargs['per_page'],
                "total": paginate.total,
            },
            "items": logs,
        }, "200 "
