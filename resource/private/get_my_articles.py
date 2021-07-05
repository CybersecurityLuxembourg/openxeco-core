from flask_apispec import MethodResource
from flask_apispec import doc
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_restful import Resource
from sqlalchemy.sql.expression import false

from db.db import DB
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from utils.serializer import Serializer


class GetMyArticles(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @doc(tags=['private'],
         description='Get the list of articles editable by the user authenticated by the token',
         responses={
             "200": {},
         })
    @jwt_required
    @catch_exception
    def get(self):

        assignment_subquery = self.db.session \
            .query(self.db.tables["UserCompanyAssignment"]) \
            .with_entities(self.db.tables["UserCompanyAssignment"].company_id) \
            .filter(self.db.tables["UserCompanyAssignment"].user_id == get_jwt_identity()) \
            .subquery()

        company_subquery = self.db.session \
            .query(self.db.tables["ArticleCompanyTag"]) \
            .with_entities(self.db.tables["ArticleCompanyTag"].article) \
            .filter(self.db.tables["ArticleCompanyTag"].company.in_(assignment_subquery)) \
            .subquery()

        data = Serializer.serialize(
            self.db.session
                .query(self.db.tables["Article"])
                .filter(self.db.tables["Article"].id.in_(company_subquery))
                .filter(self.db.tables["Article"].is_created_by_admin == false())
                .all()
            , self.db.tables["Article"])

        return data, "200 "
