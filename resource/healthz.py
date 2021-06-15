from flask_restful import Resource
from flask_apispec import MethodResource
from db.db import DB
from decorator.catch_exception import catch_exception


class Healthz(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @catch_exception
    def get(self):

        self.db.session.execute("select 1 as is_alive;")

        return "True", "200 "
