from flask_restful import Resource
from flask_jwt_extended import jwt_required
from db.db import DB
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from flask import request


class GetUsers(Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @catch_exception
    @jwt_required
    def get(self):

        filters = request.args.to_dict()

        query = self.db.session.query(self.db.tables["User"])\
            .with_entities(self.db.tables["User"].id,
                           self.db.tables["User"].email,
                           self.db.tables["User"].is_admin)

        if "admin_only" in filters and filters["admin_only"] == "true":
            query = query.filter(self.db.tables["User"].is_admin == True)

        data = [u._asdict() for u in query]

        return data, "200 "
