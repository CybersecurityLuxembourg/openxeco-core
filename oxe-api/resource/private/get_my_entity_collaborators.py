from flask_apispec import MethodResource
from flask_apispec import doc
from flask_jwt_extended import fresh_jwt_required, get_jwt_identity
from flask_restful import Resource
from sqlalchemy.orm.exc import NoResultFound

from db.db import DB
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request


class GetMyEntityCollaborators(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @doc(tags=['private'],
         description='Get the list of collaborators of the specified entity',
         responses={
             "200": {},
             "422": {"description": "Object not found or you don't have the required access to it"},
         })
    @fresh_jwt_required
    @catch_exception
    def get(self, id_):

        try:
            self.db.session \
                .query(self.db.tables["UserEntityAssignment"]) \
                .with_entities(self.db.tables["UserEntityAssignment"].entity_id) \
                .filter(self.db.tables["UserEntityAssignment"].user_id == get_jwt_identity()) \
                .filter(self.db.tables["UserEntityAssignment"].entity_id == int(id_)) \
                .one()
        except NoResultFound:
            return "", "422 Object not found or you don't have the required access to it"

        subquery = self.db.session \
            .query(self.db.tables["UserEntityAssignment"]) \
            .with_entities(self.db.tables["UserEntityAssignment"].user_id) \
            .filter(self.db.tables["UserEntityAssignment"].entity_id == int(id_)) \
            .subquery()

        data = [r._asdict() for r in self.db.session
                .query(self.db.tables["User"])
                .with_entities(self.db.tables["User"].id,
                               self.db.tables["User"].email,
                               self.db.tables["User"].first_name,
                               self.db.tables["User"].last_name)
                .filter(self.db.tables["User"].id.in_(subquery))
                .all()]

        return data, "200 "
