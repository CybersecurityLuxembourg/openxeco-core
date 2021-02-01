from flask_restful import Resource
from flask_jwt_extended import jwt_required
from utils.catch_exception import catch_exception
from utils.serializer import Serializer
from utils.log_request import log_request


class GetTaxonomyCategories(Resource):

    def __init__(self, db):
        self.db = db

    @log_request
    @catch_exception
    @jwt_required
    def get(self):

        data = self.db.get(self.db.tables["TaxonomyCategory"])
        data = Serializer.serialize(data, self.db.tables["TaxonomyCategory"])

        return data, "200 "
