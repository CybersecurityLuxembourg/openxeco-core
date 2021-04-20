from flask_restful import Resource
from flask_jwt_extended import jwt_required
from db.db import DB
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access
from utils.serializer import Serializer


class GetDataControls(Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @jwt_required
    @verify_admin_access
    @catch_exception
    def get(self):

        data_control = self.db.session.query(self.db.tables["DataControl"]).all()
        data = Serializer.serialize(data_control, self.db.tables["DataControl"])

        return data, "200 "
