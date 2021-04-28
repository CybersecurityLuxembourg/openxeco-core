from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from db.db import DB
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from utils.serializer import Serializer


class GetMyCompanies(Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @jwt_required
    @catch_exception
    def get(self):

        subquery = self.db.session \
            .query(self.db.tables["UserCompanyAssignment"]) \
            .with_entities(self.db.tables["UserCompanyAssignment"].company_id) \
            .filter(self.db.tables["UserCompanyAssignment"].user_id == get_jwt_identity()) \
            .subquery()

        data = Serializer.serialize(
            self.db.session
                .query(self.db.tables["Company"])
                .filter(self.db.tables["Company"].id.in_(subquery))
                .all()
            , self.db.tables["Company"])

        return data, "200 "
