from flask import request
from flask_jwt_extended import jwt_required
from flask_restful import Resource
from flask_apispec import MethodResource
from sqlalchemy.exc import IntegrityError
from decorator.verify_admin_access import verify_admin_access
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from webargs import fields
from flask_apispec import use_kwargs, doc


class AddTaxonomyCategory(MethodResource, Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @doc(tags=['taxonomy'],
         description='Add a taxonomy category',
         responses={
             "200": {},
             "422": {"description": "This category is already existing"}
         })
    @use_kwargs({
        'category': fields.Str(),
        'value': fields.Int(),
    })
    @jwt_required
    @verify_admin_access
    @catch_exception
    def post(self, **kwargs):

        try:
            self.db.insert(
                {"name": kwargs["category"]},
                self.db.tables["TaxonomyCategory"]
            )
        except IntegrityError as e:
            self.db.session.rollback()
            if "Duplicate entry" in str(e):
                return "", "422 This category is already existing"
            raise e

        return "", "200 "
