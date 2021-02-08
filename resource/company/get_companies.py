from flask_restful import Resource
from flask_jwt_extended import jwt_required
from db.db import DB
from utils.serializer import Serializer
from decorator.catch_exception import catch_exception
from flask import request
from decorator.log_request import log_request


class GetCompanies(Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @catch_exception
    @jwt_required
    def get(self):

        filters = request.args.to_dict()
        company_objects = self.db.get_filtered_companies(filters)
        data = Serializer.serialize(company_objects, self.db.tables["Company"])

        return data, "200 "
