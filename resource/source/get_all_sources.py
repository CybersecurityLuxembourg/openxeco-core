from flask_restful import Resource
from flask_jwt_extended import jwt_required
from db.db import DB
from utils.catch_exception import catch_exception
from utils.log_request import log_request


class GetAllSources(Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @catch_exception
    @jwt_required
    def get(self):

        sources = self.db.session.query(self.db.tables["Source"]).all()
        data = [s.name for s in sources]

        return data, "200 "
