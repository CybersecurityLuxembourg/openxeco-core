from flask_restful import Resource
from flask_jwt_extended import jwt_required
from db.db import DB
from utils.catch_exception import catch_exception
from utils.serializer import Serializer
from utils.log_request import log_request


class GetCompanyTaxonomy(Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @catch_exception
    @jwt_required
    def get(self, id):

        ta = self.db.tables["TaxonomyAssignment"]
        data = Serializer.serialize(self.db.get(ta, {"company": id}), ta)

        return data, "200 "
