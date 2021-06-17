from flask_restful import Resource
from flask_apispec import MethodResource
from db.db import DB
from utils.serializer import Serializer
from decorator.catch_exception import catch_exception
from flask_apispec import doc


class GetPublicTaxonomy(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @doc(tags=['public'],
         description='Get the taxonomy structure, including the taxonomy categories, values, '
                     'category hierarchy and value hierarchy',
         responses={
             "200": {},
         })
    @catch_exception
    def get(self):

        data = {
            "categories": Serializer.serialize(
                self.db.get(self.db.tables["TaxonomyCategory"]),
                self.db.tables["TaxonomyCategory"]
            ),
            "values": Serializer.serialize(
                self.db.get(self.db.tables["TaxonomyValue"]),
                self.db.tables["TaxonomyValue"]
            ),
            "category_hierarchy": Serializer.serialize(
                self.db.get(self.db.tables["TaxonomyCategoryHierarchy"]),
                self.db.tables["TaxonomyCategoryHierarchy"]
            ),
            "value_hierarchy": Serializer.serialize(
                self.db.get(self.db.tables["TaxonomyValueHierarchy"]),
                self.db.tables["TaxonomyValueHierarchy"]
            )
        }

        return data, "200 "
