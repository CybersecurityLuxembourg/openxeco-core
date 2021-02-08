from flask_restful import Resource
from db.db import DB
from utils.serializer import Serializer
from decorator.catch_exception import catch_exception


class GetPublicTaxonomyValues(Resource):

    def __init__(self, db: DB):
        self.db = db

    @catch_exception
    def get(self):

        data = self.db.get(self.db.tables["TaxonomyValue"])
        data = Serializer.serialize(data, self.db.tables["TaxonomyValue"])

        return data, "200 "
