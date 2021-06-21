from flask_apispec import MethodResource
from flask_apispec import doc
from flask_restful import Resource

from db.db import DB
from decorator.catch_exception import catch_exception


class Healthz(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @doc(tags=['status'],
         description='Get the status of the server',
         responses={
             "200": {},
         })
    @catch_exception
    def get(self):

        self.db.session.execute("select 1 as is_alive;")

        return "True", "200 "
