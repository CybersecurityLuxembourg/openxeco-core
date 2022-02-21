from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_restful import Resource
from webargs import fields, validate

from db.db import DB
from decorator.catch_exception import catch_exception
from utils.serializer import Serializer
from utils.response import build_no_cors_response


class GetPublicArticles(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @doc(tags=['public'],
         description='Get the public articles',
         responses={
             "200": {},
         })
    @use_kwargs({
        'page': fields.Int(required=False, missing=1, validate=validate.Range(min=1)),
        'per_page': fields.Int(required=False, missing=50, validate=validate.Range(min=1, max=50)),
        'title': fields.Str(required=False),
        'type': fields.DelimitedList(fields.Str(), required=False),
        'taxonomy_values': fields.DelimitedList(fields.Str(), required=False),
        'companies': fields.DelimitedList(fields.Int(), required=False),
        'include_tags': fields.Bool(required=False),
        'is_created_by_admin': fields.Bool(required=False),
    }, location="query")
    @catch_exception
    def get(self, **kwargs):

        kwargs["public_only"] = True

        query = self.db.get_filtered_article_query(kwargs)
        paginate = query.paginate(kwargs["page"], kwargs["per_page"])
        articles = Serializer.serialize(paginate.items, self.db.tables["Article"])

        if "include_tags" in kwargs and kwargs["include_tags"] is True:
            article_ids = [a["id"] for a in articles]

            taxonomy_tags = self.db.get(self.db.tables["ArticleTaxonomyTag"], {"article": article_ids})
            company_tags = self.db.get(self.db.tables["ArticleCompanyTag"], {"article": article_ids})

            for a in articles:
                a["taxonomy_tags"] = [t.taxonomy_value for t in taxonomy_tags if t.article == a["id"]]
                a["company_tags"] = [t.company for t in company_tags if t.article == a["id"]]

        return build_no_cors_response({
            "pagination": {
                "page": kwargs["page"],
                "pages": paginate.pages,
                "per_page": kwargs["per_page"],
                "total": paginate.total,
            },
            "items": articles,
        })
