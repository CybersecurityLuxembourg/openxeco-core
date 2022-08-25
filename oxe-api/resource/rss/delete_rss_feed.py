from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_jwt_extended import jwt_required
from flask_restful import Resource
from webargs import fields

from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access
from exception.object_not_found import ObjectNotFound


class DeleteRssFeed(MethodResource, Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @doc(tags=['rss'],
         description='Delete a RSS feed',
         responses={
             "200": {},
             "422": {"description": "Object not found"},
         })
    @use_kwargs({
        'url': fields.Str(),
    })
    @jwt_required
    @verify_admin_access
    @catch_exception
    def post(self, **kwargs):

        feed = self.db.get(self.db.tables["RssFeed"], {"url": kwargs["url"]})

        if len(feed) > 0:
            self.db.delete(self.db.tables["RssFeed"], {"url": kwargs["url"]})
        else:
            raise ObjectNotFound

        return "", "200 "
