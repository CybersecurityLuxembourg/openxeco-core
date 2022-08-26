from flask_apispec import MethodResource
from flask_apispec import doc
from flask_jwt_extended import jwt_required
from flask_restful import Resource

from db.db import DB
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access
from utils.serializer import Serializer


class GetArticleTags(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @doc(tags=['article'],
         description='Get taxonomy and entity tags of an article specified by its ID',
         responses={
             "200": {},
         })
    @jwt_required
    @verify_admin_access
    @catch_exception
    def get(self, id_):
        taxonomy_sub_query = self.db.session.query(self.db.tables["ArticleTaxonomyTag"]) \
            .with_entities(self.db.tables["ArticleTaxonomyTag"].taxonomy_value_id) \
            .filter(self.db.tables["ArticleTaxonomyTag"].article_id == id_) \
            .subquery('t1')

        entity_sub_query = self.db.session.query(self.db.tables["ArticleEntityTag"]) \
            .with_entities(self.db.tables["ArticleEntityTag"].entity_id) \
            .filter(self.db.tables["ArticleEntityTag"].article_id == id_) \
            .subquery('t2')

        data = {
            "entity_tags": Serializer.serialize(self.db.session.query(self.db.tables["Entity"])
                                                 .filter(self.db.tables["Entity"].id.in_(entity_sub_query))
                                                 .all(), self.db.tables["Entity"]),
            "taxonomy_tags": Serializer.serialize(self.db.session.query(self.db.tables["TaxonomyValue"])
                                                  .filter(self.db.tables["TaxonomyValue"].id.in_(taxonomy_sub_query))
                                                  .all(), self.db.tables["TaxonomyValue"]),
        }

        return data, "200 "
