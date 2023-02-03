from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_jwt_extended import fresh_jwt_required
from flask_restful import Resource
from webargs import fields

from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access


class AddArticleVersion(MethodResource, Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @doc(tags=['article'],
         description='Add an article version',
         responses={
             "200": {},
             "422": {"description": "The provided article does not exist"},
         })
    @use_kwargs({
        'name': fields.Str(),
        'article_id': fields.Int(),
    })
    @fresh_jwt_required
    @verify_admin_access
    @catch_exception
    def post(self, **kwargs):

        if len(self.db.get(self.db.tables["Article"], {"id": kwargs["article_id"]})) == 0:
            return "", "422 The provided article does not exist"

        self.db.insert(kwargs, self.db.tables["ArticleVersion"])

        return "", "200 "
