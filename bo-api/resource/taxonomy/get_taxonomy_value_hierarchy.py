from flask_apispec import MethodResource
from flask_apispec import doc
from flask_jwt_extended import jwt_required
from flask_restful import Resource

from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access
from utils.serializer import Serializer


class GetTaxonomyValueHierarchy(MethodResource, Resource):

    def __init__(self, db):
        self.db = db

    @log_request
    @doc(tags=['taxonomy'],
         description='Get the whole taxonomy value hierarchy',
         responses={
             "200": {},
         })
    @jwt_required
    @verify_admin_access
    @catch_exception
    def get(self):

        tvh = self.db.tables["TaxonomyValueHierarchy"]
        data = Serializer.serialize(self.db.get(tvh), tvh)

        return data, "200 "
