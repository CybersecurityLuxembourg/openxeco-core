from flask_restful import Resource
from flask_jwt_extended import jwt_required
from utils.catch_exception import catch_exception
from utils.serializer import Serializer
from utils.log_request import log_request


class GetAllTaxonomyValueHierarchy(Resource):

    def __init__(self, db):
        self.db = db

    @log_request
    @catch_exception
    @jwt_required
    def get(self):

        tvh = self.db.tables["TaxonomyValueHierarchy"]

        data = Serializer.serialize(self.db.get(tvh), tvh)

        return data, "200 "
