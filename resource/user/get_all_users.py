from flask_restful import Resource
from flask_jwt_extended import jwt_required
from db.db import DB
from utils.catch_exception import catch_exception
from utils.log_request import log_request


class GetAllUsers(Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @catch_exception
    @jwt_required
    def get(self):

        query = self.db.session.query(self.db.tables["User"])\
            .with_entities(self.db.tables["User"].id, self.db.tables["User"].email)
        data = [u._asdict() for u in query]

        return data, "200 "
