from flask_restful import Resource
from flask_jwt_extended import jwt_required
from db.db import DB
from decorator.verify_admin_access import verify_admin_access
from utils.serializer import Serializer
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request


class GetArticleTags(Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @jwt_required
    @verify_admin_access
    @catch_exception
    def get(self, id_):
        taxonomy_sub_query = self.db.session.query(self.db.tables["ArticleTaxonomyTag"]) \
            .with_entities(self.db.tables["ArticleTaxonomyTag"].taxonomy_value) \
            .filter(self.db.tables["ArticleTaxonomyTag"].article == id_) \
            .subquery('t1')

        company_sub_query = self.db.session.query(self.db.tables["ArticleCompanyTag"]) \
            .with_entities(self.db.tables["ArticleCompanyTag"].company) \
            .filter(self.db.tables["ArticleCompanyTag"].article == id_) \
            .subquery('t2')

        data = {
            "company_tags": Serializer.serialize(self.db.session.query(self.db.tables["Company"])
                                                 .filter(self.db.tables["Company"].id.in_(company_sub_query))
                                                 .all(), self.db.tables["Company"]),
            "taxonomy_tags": Serializer.serialize(self.db.session.query(self.db.tables["TaxonomyValue"])
                                                  .filter(self.db.tables["TaxonomyValue"].id.in_(taxonomy_sub_query))
                                                  .all(), self.db.tables["TaxonomyValue"]),
        }

        return data, "200 "
