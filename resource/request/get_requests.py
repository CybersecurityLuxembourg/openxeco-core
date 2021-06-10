from flask_restful import Resource
from flask_jwt_extended import jwt_required
from db.db import DB
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access
from utils.serializer import Serializer
from flask import request


class GetRequests(Resource):

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

        query = self.db.session.query(self.db.tables["UserRequest"])

        if "status" in filters:
            types = filters["status"].split(",")
            query = query.filter(self.db.tables["UserRequest"].status.in_(types))

        pagination = query.paginate(page, per_page)
        data = Serializer.serialize(pagination.items, self.db.tables["UserRequest"])

        return {
            "pagination": {
                "page": page,
                "pages": pagination.pages,
                "per_page": per_page,
                "total": pagination.total,
            },
            "items": data,
        }, "200 "
