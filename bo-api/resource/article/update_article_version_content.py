from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_jwt_extended import jwt_required
from flask_restful import Resource
from webargs import fields

from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access


class UpdateArticleVersionContent(MethodResource, Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @doc(tags=['article'],
         description='Update content of an article version',
         responses={
             "200": {},
             "422.a": {"description": "The provided article version ID does not exist"},
             "422.b": {"description": "Wrong content type found: XXX"},
         })
    @use_kwargs({
        'article_version_id': fields.Int(),
        'content': fields.List(fields.Dict()),
    })
    @jwt_required
    @verify_admin_access
    @catch_exception
    def post(self, **kwargs):

        if len(self.db.get(self.db.tables["ArticleVersion"], {"id": kwargs["article_version_id"]})) < 1:
            return "", "422 The provided article version ID does not exist"

        self.db.delete(
            self.db.tables["ArticleBox"], {"article_version_id": kwargs["article_version_id"]},
            commit=False
        )

        for i, c in enumerate(kwargs["content"]):
            c = {k: c[k] for k in ["type", "content"]}
            c["position"] = i + 1
            c["article_version_id"] = kwargs["article_version_id"]

            if c["type"] not in self.db.tables["ArticleBox"].__table__.columns["type"].type.enums:
                self.db.session.rollback()
                return "", f"422 Wrong content type found: '{c['type']}'"

            self.db.insert(c, self.db.tables["ArticleBox"], commit=False)

        self.db.session.commit()

        return "", "200 "
