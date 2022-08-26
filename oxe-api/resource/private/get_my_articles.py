from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_restful import Resource
from webargs import fields, validate

from db.db import DB
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from utils.serializer import Serializer


class GetMyArticles(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @doc(tags=['private'],
         description='Get the list of articles editable by the user authenticated by the token',
         responses={
             "200": {},
         })
    @use_kwargs({
        'page': fields.Int(required=False, missing=1, validate=validate.Range(min=1)),
        'per_page': fields.Int(required=False, missing=50, validate=validate.Range(min=1, max=50)),
        'title': fields.Str(required=False),
        'type': fields.DelimitedList(fields.Str(), required=False),
        'taxonomy_values': fields.DelimitedList(fields.Int(), required=False),
        'include_tags': fields.Bool(required=False),
    }, location="query")
    @jwt_required
    @catch_exception
    def get(self, **kwargs):

        kwargs["editable"] = True
        kwargs["is_created_by_admin"] = False

        query = self.db.get_filtered_article_query(kwargs, get_jwt_identity())
        paginate = query.paginate(kwargs["page"], kwargs["per_page"])
        articles = Serializer.serialize(paginate.items, self.db.tables["Article"])

        if "include_tags" in kwargs and kwargs["include_tags"] is True:
            article_ids = [a["id"] for a in articles]

            taxonomy_tags = self.db.get(self.db.tables["ArticleTaxonomyTag"], {"article_id": article_ids})
            entity_tags = self.db.get(self.db.tables["ArticleEntityTag"], {"article_id": article_ids})

            for a in articles:
                a["taxonomy_tags"] = [t.taxonomy_value_id for t in taxonomy_tags if t.article_id == a["id"]]
                a["entity_tags"] = [t.entity_id for t in entity_tags if t.article_id == a["id"]]

        return {
           "pagination": {
               "page": kwargs["page"],
               "pages": paginate.pages,
               "per_page": kwargs["per_page"],
               "total": paginate.total,
           },
           "items": articles,
        }, "200 "
