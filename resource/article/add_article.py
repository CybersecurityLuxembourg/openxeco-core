import re

from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_jwt_extended import jwt_required
from flask_restful import Resource
from webargs import fields

from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access
from utils.serializer import Serializer


class AddArticle(MethodResource, Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @doc(tags=['article'],
         description='Add an article determined by its title',
         responses={
             "200": {},
         })
    @use_kwargs({
        'title': fields.Str(),
    })
    @jwt_required
    @verify_admin_access
    @catch_exception
    def post(self, **kwargs):

        article = self.db.insert({
            "title": kwargs["title"],
            "handle": re.sub(r'[^a-z1-9-]', '', kwargs["title"].lower().replace(" ", "-"))[:100],
            "is_created_by_admin": True,
        }, self.db.tables["Article"])
        self.db.insert({
            "article_id": article.id,
            "name": "Version 0",
            "is_main": True
        }, self.db.tables["ArticleVersion"])

        return Serializer.serialize(article, self.db.tables["Company"]), "200 "
