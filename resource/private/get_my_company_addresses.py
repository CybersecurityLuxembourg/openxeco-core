from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from db.db import DB
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from utils.serializer import Serializer
from sqlalchemy.orm.exc import NoResultFound


class GetMyCompanyAddresses(Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
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
            return "", f"422 Object not found or you don't have the required access to it"

        data = Serializer.serialize(
            self.db.session
                .query(self.db.tables["Company_Address"])
                .filter(self.db.tables["Company_Address"].company_id == int(id_))
                .all(),
            self.db.tables["Company_Address"]
        )

        return data, "200 "
