from flask_apispec import MethodResource
from flask_apispec import doc
from flask_jwt_extended import jwt_required
from flask_restful import Resource

from db.db import DB
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access
from utils.serializer import Serializer


class GetCompanyContacts(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @doc(tags=['company'],
         description='Get the list of contacts of a company specified by its ID',
         responses={
             "200": {},
         })
    @jwt_required
    @verify_admin_access
    @catch_exception
    def get(self, id_):

        data = self.db.get(self.db.tables["CompanyContact"], {"company_id": id_})
        data = Serializer.serialize(data, self.db.tables["CompanyContact"])

        return data, "200 "
