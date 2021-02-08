from flask_restful import Resource
from flask_jwt_extended import jwt_required
from decorator.catch_exception import catch_exception
from utils.serializer import Serializer
from flask import request
from decorator.log_request import log_request


class GetTaxonomyValues(Resource):

    def __init__(self, db):
        self.db = db

    @log_request
    @catch_exception
    @jwt_required
    def get(self):

        args = request.args.to_dict()
        filters = {}

        if "category" in args:
            filters["category"] = args["category"]

        data = self.db.get(self.db.tables["TaxonomyValue"], filters)
        data = Serializer.serialize(data, self.db.tables["TaxonomyValue"])

        return data, "200 "
