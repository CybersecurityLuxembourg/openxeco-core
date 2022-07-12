from flask_apispec import MethodResource
from flask_apispec import doc
from flask_restful import Resource

from db.db import DB
from decorator.catch_exception import catch_exception
from utils.serializer import Serializer
from utils.response import build_no_cors_response


class GetNetworkNodes(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @doc(tags=['network'],
         description='Get the network nodes registered in this node',
         responses={
             "200": {},
         })
    @catch_exception
    def get(self):

        nodes = Serializer.serialize(
            self.db.get(self.db.tables["NetworkNode"]),
            self.db.tables["NetworkNode"]
        )

        return build_no_cors_response(nodes), "200 "
