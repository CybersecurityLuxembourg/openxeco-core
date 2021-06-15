from flask_restful import Resource
from flask_apispec import MethodResource
from flask_jwt_extended import jwt_required
from db.db import DB
from decorator.verify_admin_access import verify_admin_access
from utils.serializer import Serializer
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from flask import request


class GetLogs(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @jwt_required
    @verify_admin_access
    @catch_exception
    def get(self):

        filters = request.args.to_dict()

        per_page = 50 if "per_page" not in filters or not filters["per_page"].isdigit() \
                         or int(filters["per_page"]) > 50 else int(filters["per_page"])
        page = 1 if "page" not in filters or not filters["page"].isdigit() else int(filters["page"])

        query = self.db.session.query(self.db.tables["Log"])

        if "resource" in filters and isinstance(filters["resource"], str):
            query = query.filter(self.db.tables["Log"].request.like(f"%{filters['resource']}%"))

        if "order" in filters and filters["order"] == "desc":
            query = query.order_by(self.db.tables["Log"].sys_date.desc())
        else:
            query = query.order_by(self.db.tables["Log"].sys_date.asc())

        pagination = query.paginate(page, per_page)
        logs = Serializer.serialize(pagination.items, self.db.tables["Log"])

        return {
            "pagination": {
                "page": page,
                "pages": pagination.pages,
                "per_page": per_page,
                "total": pagination.total,
            },
            "items": logs,
        }, "200 "
