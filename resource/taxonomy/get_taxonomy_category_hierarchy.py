from flask_restful import Resource
from flask_apispec import MethodResource
from flask_jwt_extended import jwt_required
from decorator.catch_exception import catch_exception
from decorator.verify_admin_access import verify_admin_access
from utils.serializer import Serializer
from decorator.log_request import log_request
from flask_apispec import doc


class GetTaxonomyCategoryHierarchy(MethodResource, Resource):

    def __init__(self, db):
        self.db = db

    @log_request
    @doc(tags=['taxonomy'],
         description='Get the whole taxonomy category hierarchy',
         responses={
             "200": {},
         })
    @jwt_required
    @verify_admin_access
    @catch_exception
    def get(self):

        data = self.db.get(self.db.tables["TaxonomyCategoryHierarchy"])
        data = Serializer.serialize(data, self.db.tables["TaxonomyCategoryHierarchy"])

        return data, "200 "
