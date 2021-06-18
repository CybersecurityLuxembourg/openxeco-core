from flask_restful import Resource
from flask_apispec import MethodResource
from flask_jwt_extended import jwt_required
from db.db import DB
from decorator.catch_exception import catch_exception
from decorator.verify_admin_access import verify_admin_access
from utils.serializer import Serializer
from decorator.log_request import log_request
from flask_apispec import doc


class GetCompanyTaxonomy(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @doc(tags=['company'],
         description='Get the company taxonomy assignments',
         responses={
             "200": {},
         })
    @jwt_required
    @verify_admin_access
    @catch_exception
    def get(self, id_):

        ta = self.db.tables["TaxonomyAssignment"]
        data = Serializer.serialize(self.db.get(ta, {"company": id_}), ta)

        return data, "200 "
