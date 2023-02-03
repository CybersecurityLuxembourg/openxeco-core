from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_jwt_extended import fresh_jwt_required
from flask_restful import Resource
from webargs import fields

from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access


class AddRssFeed(MethodResource, Resource):

    def __init__(self, db):
        self.db = db

    @log_request
    @doc(tags=['rss'],
         description='Add a RSS feed',
         responses={
             "200": {},
             "422": {"description": "Provided RSS feed already exists"},
         })
    @use_kwargs({
        'url': fields.Str(),
    })
    @fresh_jwt_required
    @verify_admin_access
    @catch_exception
    def post(self, **kwargs):

        # Checking feeds

        feed = self.db.get(self.db.tables["RssFeed"], kwargs)

        if len(feed) > 0:
            return "", "422 Provided RSS feed already exists"

        # Insert

        self.db.insert(kwargs, self.db.tables["RssFeed"])

        return "", "200 "
