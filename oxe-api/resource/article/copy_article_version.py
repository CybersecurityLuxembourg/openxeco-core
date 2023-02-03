from datetime import datetime

from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_jwt_extended import fresh_jwt_required
from flask_restful import Resource
from webargs import fields

from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access
from utils.serializer import Serializer


class CopyArticleVersion(MethodResource, Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @doc(tags=['article'],
         description='Copy an article version',
         responses={
             "200": {},
             "422": {"description": "The provided article version ID does not exist"},
         })
    @use_kwargs({
        'name': fields.Str(required=False),
        'article_version_id': fields.Int(),
    })
    @fresh_jwt_required
    @verify_admin_access
    @catch_exception
    def post(self, **kwargs):

        article_version = self.db.get(self.db.tables["ArticleVersion"], {"id": kwargs["article_version_id"]})

        if len(article_version) > 0:
            article_version = article_version[0]
        else:
            return "", "422 The provided article version ID does not exist"

        copied_version = Serializer.serialize(article_version, self.db.tables["ArticleVersion"])
        del copied_version["id"]
        copied_version["name"] = kwargs["name"] if "name" in kwargs else \
            f"{copied_version['name']} - Copy {datetime.now().strftime('%Y-%m-%d %H:%M')}"
        copied_version["is_main"] = False
        copied_version = self.db.insert(copied_version, self.db.tables["ArticleVersion"], commit=False)

        content = self.db.get(self.db.tables["ArticleBox"], {"article_version_id": article_version.id})

        for c in content:
            c = Serializer.serialize(c, self.db.tables["ArticleBox"])
            c["article_version_id"] = copied_version.id
            del c["id"]
            self.db.insert(c, self.db.tables["ArticleBox"], commit=False)

        self.db.session.commit()

        return "", "200 "
