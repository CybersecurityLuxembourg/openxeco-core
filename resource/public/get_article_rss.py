from flask_restful import Resource
from db.db import DB
from utils.serializer import Serializer
from utils.catch_exception import catch_exception
from flask import request


class GetArticleRSS(Resource):

    def __init__(self, db: DB):
        self.db = db

    @catch_exception
    def get(self):

        #TODO

        return [], "200 "
