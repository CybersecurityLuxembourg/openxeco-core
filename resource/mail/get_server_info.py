from flask_restful import Resource
from flask_jwt_extended import jwt_required
from config.config import MAIL_SERVER, MAIL_PORT
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request


class GetServerInfo(Resource):

    def __init__(self, db):
        self.db = db

    @log_request
    @catch_exception
    @jwt_required
    def get(self):

        data = {
            'server': MAIL_SERVER,
            'port': MAIL_PORT
        }

        return data, "200 "
