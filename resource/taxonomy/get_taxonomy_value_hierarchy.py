from flask_restful import Resource
from flask_jwt_extended import jwt_required
from decorator.catch_exception import catch_exception
from utils.serializer import Serializer
from flask import request
from decorator.log_request import log_request


class GetTaxonomyValueHierarchy(Resource):

    def __init__(self, db):
        self.db = db

    @log_request
    @catch_exception
    @jwt_required
    def get(self):

        args = request.args.to_dict()
        row = {}

        if "parent_category" not in args:
            return "", "422 Parent category is missing as parameter"
        else:
            row["parent_category"] = args["parent_category"]

        if "child_category" not in args:
            return "", "422 Child category is missing as parameter"
        else:
            row["child_category"] = args["child_category"]

        if len(self.db.get(self.db.tables["TaxonomyCategoryHierarchy"], row)) < 1:
            return "", "422 The relation between those two categories does not exist"

        tv = self.db.tables["TaxonomyValue"]
        tvh = self.db.tables["TaxonomyValueHierarchy"]

        data = dict()
        data["parent_values"] = Serializer.serialize(self.db.get(tv, {"category": args["parent_category"]}), tv)
        data["child_values"] = Serializer.serialize(self.db.get(tv, {"category": args["child_category"]}), tv)
        data["value_hierarchy"] = Serializer \
            .serialize(self.db.get_value_hierarchy(args["parent_category"], args["child_category"]), tvh)

        return data, "200 "
