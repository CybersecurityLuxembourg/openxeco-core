from flask_apispec import MethodResource
from flask_apispec import doc
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_restful import Resource
from sqlalchemy.orm.exc import NoResultFound

from db.db import DB
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from utils.serializer import Serializer


class GetMyEntityContacts(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @doc(tags=['private'],
         description='Get the list of contacts for a given entity',
         responses={
             "200": {},
         })
    @jwt_required
    @catch_exception
    def get(self, id_):

        try:
            self.db.session \
                .query(self.db.tables["UserEntityAssignment"]) \
                .with_entities(self.db.tables["UserEntityAssignment"].entity_id) \
                .filter(self.db.tables["UserEntityAssignment"].user_id == int(get_jwt_identity())) \
                .filter(self.db.tables["UserEntityAssignment"].entity_id == int(id_)) \
                .one()
        except NoResultFound:
            return "", "422 Object not found or you don't have the required access to it"

        contact = self.db.get(self.db.tables["EntityContact"], {"entity_id": int(id_)})[0]
        user = self.db.get(self.db.tables["UserEntityAssignment"], {
            "user_id": contact.user_id,
            "entity_id": int(id_),
        })[0]

        is_primary = int(get_jwt_identity()) == contact.user_id

        data = {
            "name": contact.name,
            "work_email": user.work_email,
            "work_telephone": user.work_telephone,
            "seniority_level": user.seniority_level if is_primary else "",
            "department": user.department if is_primary else "",
            "acknowledged": "Yes" if is_primary else "",
            "primary": is_primary,
        }

        return data, "200 "
