from flask_restful import Resource
from flask_apispec import MethodResource
from db.db import DB
from utils.serializer import Serializer
from decorator.catch_exception import catch_exception
from flask import request


class GetPublicArticles(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @catch_exception
    def get(self):

        filters = request.args.to_dict()
        filters["public_only"] = "true"

        per_page = 50 if "per_page" not in filters or not filters["per_page"].isdigit() \
            or int(filters["per_page"]) > 50 else int(filters["per_page"])
        page = 1 if "page" not in filters or not filters["page"].isdigit() else int(filters["page"])

        query = self.db.get_filtered_article_query(filters)
        paginate = query.paginate(page, per_page)
        articles = Serializer.serialize(paginate.items, self.db.tables["Article"])

        if "include_tags" in filters and filters["include_tags"] == "true":
            article_ids = [a["id"] for a in articles]

            taxonomy_tags = self.db.get(self.db.tables["ArticleTaxonomyTag"], {"article": article_ids})
            company_tags = self.db.get(self.db.tables["ArticleCompanyTag"], {"article": article_ids})

            for a in articles:
                a["taxonomy_tags"] = [t.taxonomy_value for t in taxonomy_tags if t.article == a["id"]]
                a["company_tags"] = [t.company for t in company_tags if t.article == a["id"]]

        return {
            "pagination": {
                "page": page,
                "pages": paginate.pages,
                "per_page": per_page,
                "total": paginate.total,
            },
            "items": articles,
        }, "200 "
