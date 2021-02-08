from flask_restful import Resource
from db.db import DB
from decorator.catch_exception import catch_exception


class GetArticleRSS(Resource):

    def __init__(self, db: DB):
        self.db = db

    @catch_exception
    def get(self):

        # TODO

        return [], "200 "
