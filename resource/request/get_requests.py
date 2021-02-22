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
    @catch_exception
    @jwt_required
    @verify_admin_access
    def get(self):

        filters = request.args.to_dict()

        query = self.db.session.query(self.db.tables["UserRequest"])

        if "status" in filters:
            types = filters["status"].split(",")
            query = query.filter(self.db.tables["UserRequest"].status.in_(types))

        data = query.all()
        data = Serializer.serialize(data, self.db.tables["UserRequest"])

        return data, "200 "
