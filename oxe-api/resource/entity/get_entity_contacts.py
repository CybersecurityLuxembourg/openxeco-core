from flask_apispec import MethodResource
from flask_apispec import doc
from flask_jwt_extended import jwt_required
from flask_restful import Resource

from db.db import DB
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access
from utils.serializer import Serializer


class GetEntityContacts(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @doc(tags=['entity'],
         description='Get the list of contacts of an entity specified by its ID',
         responses={
             "200": {},
         })
    @jwt_required
    @verify_admin_access
    @catch_exception
    def get(self, id_):

        contact = self.db.get(self.db.tables["EntityContact"], {"entity_id": int(id_)})[0]

        data = Serializer.serialize(contact, self.db.tables["EntityContact"])

        users = self.db.get(self.db.tables["UserEntityAssignment"], {
            "user_id": contact.user_id,
            "entity_id": int(id_),
        })

        if len(users) > 0:
            user = users[0]

            # Add UserEntityAssignment contact info to first item in EntityContact result
            data[0]["work_email"] = user.work_email
            data[0]["work_telephone"] = user.work_telephone

        return data, "200 "
