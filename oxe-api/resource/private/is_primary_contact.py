from flask_apispec import MethodResource
from flask_apispec import doc
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_restful import Resource

from db.db import DB
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request


class IsPrimaryContact(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @doc(tags=['private'],
         description='Check if logged in user is the primary contact for the entity',
         responses={
             "200": {},
         })
    @jwt_required
    @catch_exception
    def get(self, id_):

        contacts = self.db.get(self.db.tables["EntityContact"], {
            "entity_id": id_,
            "user_id": int(get_jwt_identity())
        })

        if len(contacts) > 0:
            return {}, "200 "

        return "", "422 You are not the primary contact"
