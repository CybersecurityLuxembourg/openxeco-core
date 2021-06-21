from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_jwt_extended import jwt_required
from flask_restful import Resource
from webargs import fields

from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access
from exception.object_not_found import ObjectNotFound


class DeleteArticleVersion(MethodResource, Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @doc(tags=['article'],
         description='Delete an article version by its ID',
         responses={
             "200": {},
             "422.a": {"description": "Object not found"},
             "422.b": {"description": "Cannot delete a version defined as a main version"}
         })
    @use_kwargs({
        'id': fields.Int(),
    })
    @jwt_required
    @verify_admin_access
    @catch_exception
    def post(self, **kwargs):

        companies = self.db.get(self.db.tables["ArticleVersion"], {"id": kwargs["id"]})

        if len(companies) == 0:
            raise ObjectNotFound

        if not companies[0].is_main:
            self.db.delete(self.db.tables["ArticleVersion"], {"id": kwargs["id"]})
        else:
            return "", "422 Cannot delete a version defined as a main version"

        return "", "200 "
