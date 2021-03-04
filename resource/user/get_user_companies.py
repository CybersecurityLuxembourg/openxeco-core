from flask_restful import Resource
from flask_jwt_extended import jwt_required
from db.db import DB
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access
from utils.serializer import Serializer


class GetUserCompanies(Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @catch_exception
    @jwt_required
    @verify_admin_access
    def get(self, id_):

        subquery = self.db.session \
            .query(self.db.tables["UserCompanyAssignment"]) \
            .with_entities(self.db.tables["UserCompanyAssignment"].company_id) \
            .filter(self.db.tables["UserCompanyAssignment"].user_id == int(id_)) \
            .subquery()

        data = self.db.session \
            .query(self.db.tables["Company"]) \
            .filter(self.db.tables["Company"].id.in_(subquery)) \
            .all()

        data = Serializer.serialize(data, self.db.tables["Company"])

        return data, "200 "
