from flask_apispec import MethodResource
from flask_apispec import doc
from flask_jwt_extended import fresh_jwt_required
from flask_restful import Resource

from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access
from utils.resource import get_admin_post_resources


class GetResources(MethodResource, Resource):

    def __init__(self, db, api):
        self.api = api
        self.db = db

    @log_request
    @doc(tags=['resource'],
         description='Get the list of the POST resources of the API',
         responses={
             "200": {},
         })
    @fresh_jwt_required
    @verify_admin_access
    @catch_exception
    def get(self):

        return get_admin_post_resources(self.api), "200 "
