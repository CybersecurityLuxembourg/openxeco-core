from flask import request
from flask_apispec import MethodResource
from flask_apispec import doc
from flask_jwt_extended import fresh_jwt_required
from flask_restful import Resource
from sqlalchemy import func, or_

from db.db import DB
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access
from utils.serializer import Serializer


class GetDataControls(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @doc(tags=['datacontrol'],
         description='Get all data control records',
         responses={
             "200": {},
         })
    @fresh_jwt_required
    @verify_admin_access
    @catch_exception
    def get(self):

        filters = request.args.to_dict()

        per_page = 50 if "per_page" not in filters or not filters["per_page"].isdigit() \
                         or int(filters["per_page"]) > 50 else int(filters["per_page"])
        page = 1 if "page" not in filters or not filters["page"].isdigit() else int(filters["page"])

        query = self.db.session.query(self.db.tables["DataControl"])

        if "search" in filters and filters["search"] is not None:
            query = query.filter(or_(func.lower(self.db.tables["DataControl"].value)
                                     .like("%" + filters["search"] + "%"),
                                     func.lower(self.db.tables["DataControl"].category)
                                     .like("%" + filters["search"] + "%")))

        pagination = query.paginate(page, per_page)
        data = Serializer.serialize(pagination.items, self.db.tables["DataControl"])

        return {
            "pagination": {
                "page": page,
                "pages": pagination.pages,
                "per_page": per_page,
                "total": pagination.total,
            },
            "items": data,
        }, "200 "
