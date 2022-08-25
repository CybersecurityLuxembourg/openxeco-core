from flask_apispec import MethodResource
from flask_apispec import doc
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_restful import Resource
from sqlalchemy.orm.exc import NoResultFound

from db.db import DB
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from utils.serializer import Serializer


class GetMyCompanyTaxonomy(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @doc(tags=['private'],
         description='Get the list of taxonomy values assigned to the specified entity',
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
                .with_entities(self.db.tables["UserCompanyAssignment"].entity_id) \
                .filter(self.db.tables["UserCompanyAssignment"].user_id == get_jwt_identity()) \
                .filter(self.db.tables["UserCompanyAssignment"].entity_id == int(id_)) \
                .one()
        except NoResultFound:
            return "", "422 Object not found or you don't have the required access to it"

        data = Serializer.serialize(
            self.db.session
                .query(self.db.tables["TaxonomyAssignment"])
                .filter(self.db.tables["TaxonomyAssignment"].entity == int(id_))
                .all(),
            self.db.tables["TaxonomyAssignment"]
        )

        return data, "200 "
