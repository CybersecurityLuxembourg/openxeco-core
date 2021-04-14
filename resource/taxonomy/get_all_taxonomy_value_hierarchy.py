from flask_restful import Resource
from flask_jwt_extended import jwt_required
from decorator.catch_exception import catch_exception
from decorator.verify_admin_access import verify_admin_access
from utils.serializer import Serializer
from decorator.log_request import log_request


class GetAllTaxonomyValueHierarchy(Resource):

    def __init__(self, db):
        self.db = db

    @log_request
    @jwt_required
    @verify_admin_access
    @catch_exception
    def get(self):

        tvh = self.db.tables["TaxonomyValueHierarchy"]

        data = Serializer.serialize(self.db.get(tvh), tvh)

        return data, "200 "
