from flask_apispec import MethodResource
from flask_apispec import doc
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_restful import Resource

from db.db import DB
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from utils.serializer import Serializer


class GetMyEntities(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @doc(tags=['private'],
         description='Get the list of entities assigned to the user authenticated by the token',
         responses={
             "200": {},
         })
    @jwt_required
    @catch_exception
    def get(self):

        subquery = self.db.session \
            .query(self.db.tables["UserEntityAssignment"]) \
            .with_entities(self.db.tables["UserEntityAssignment"].entity_id) \
            .filter(self.db.tables["UserEntityAssignment"].user_id == get_jwt_identity()) \
            .subquery()

        data = Serializer.serialize(
            self.db.session
                .query(self.db.tables["Entity"])
                .filter(self.db.tables["Entity"].id.in_(subquery))
                .all()
            , self.db.tables["Entity"])

        return data, "200 "
