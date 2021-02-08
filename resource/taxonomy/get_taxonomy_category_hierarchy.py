from flask_restful import Resource
from flask_jwt_extended import jwt_required
from decorator.catch_exception import catch_exception
from utils.serializer import Serializer
from decorator.log_request import log_request


class GetTaxonomyCategoryHierarchy(Resource):

    def __init__(self, db):
        self.db = db

    @log_request
    @catch_exception
    @jwt_required
    def get(self):

        data = self.db.get(self.db.tables["TaxonomyCategoryHierarchy"])
        data = Serializer.serialize(data, self.db.tables["TaxonomyCategoryHierarchy"])

        return data, "200 "
