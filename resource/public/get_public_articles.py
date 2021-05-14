from flask_restful import Resource
from db.db import DB
from utils.serializer import Serializer
from decorator.catch_exception import catch_exception
from flask import request


class GetPublicArticles(Resource):

    def __init__(self, db: DB):
        self.db = db

    @catch_exception
    def get(self):

        filters = request.args.to_dict()
        filters["public_only"] = "true"
        article_objects = self.db.get_filtered_articles(filters)
        data = Serializer.serialize(article_objects, self.db.tables["Article"])

        if "include_tags" in filters and filters["public_only"] == "true":
            article_ids = [a["id"] for a in data]

            taxonomy_tags = self.db.get(self.db.tables["ArticleTaxonomyTag"], {"article": article_ids})
            company_tags = self.db.get(self.db.tables["ArticleCompanyTag"], {"article": article_ids})

            for a in data:
                a["taxonomy_tags"] = [t.taxonomy_value for t in taxonomy_tags if t.article == a["id"]]
                a["company_tags"] = [t.company for t in company_tags if t.article == a["id"]]

        return data, "200 "
