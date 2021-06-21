from flask_apispec import MethodResource
from flask_apispec import doc
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_restful import Resource
from sqlalchemy.orm.exc import NoResultFound

from db.db import DB
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from utils.serializer import Serializer


class GetMyCompanyAddresses(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @doc(tags=['private'],
         description='Get the list of addresses of a company assigned to the user related to the token',
         responses={
             "200": {},
             "422": {"description": "Object not found or you don't have the required access to it"},
         })
    @jwt_required
    @catch_exception
    def get(self, id_):

        try:
            self.db.session \
                .query(self.db.tables["UserCompanyAssignment"]) \
                .with_entities(self.db.tables["UserCompanyAssignment"].company_id) \
                .filter(self.db.tables["UserCompanyAssignment"].user_id == int(get_jwt_identity())) \
                .filter(self.db.tables["UserCompanyAssignment"].company_id == int(id_)) \
                .one()
        except NoResultFound:
            return "", "422 Object not found or you don't have the required access to it"

        data = Serializer.serialize(
            self.db.session
                .query(self.db.tables["Company_Address"])
                .filter(self.db.tables["Company_Address"].company_id == int(id_))
                .all(),
            self.db.tables["Company_Address"]
        )

        return data, "200 "
