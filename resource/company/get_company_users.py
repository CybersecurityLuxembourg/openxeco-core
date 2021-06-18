from flask_restful import Resource
from flask_apispec import MethodResource
from flask_jwt_extended import jwt_required
from db.db import DB
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access
from flask_apispec import doc


class GetCompanyUsers(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @doc(tags=['company'],
         description='Get the users assigned to a company specified by its ID',
         responses={
             "200": {},
         })
    @jwt_required
    @verify_admin_access
    @catch_exception
    def get(self, id_):

        subquery = self.db.session \
            .query(self.db.tables["UserCompanyAssignment"]) \
            .with_entities(self.db.tables["UserCompanyAssignment"].user_id) \
            .filter(self.db.tables["UserCompanyAssignment"].company_id == int(id_)) \
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
