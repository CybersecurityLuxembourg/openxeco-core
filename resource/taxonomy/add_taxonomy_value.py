from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_jwt_extended import jwt_required
from flask_restful import Resource
from sqlalchemy.exc import IntegrityError
from webargs import fields

from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access


class AddTaxonomyValue(MethodResource, Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @doc(tags=['taxonomy'],
         description='Add a taxonomy value',
         responses={
             "200": {},
             "422.a": {"description": "The provided category does not exist"},
             "422.b": {"description": "This value is already existing"},
         })
    @use_kwargs({
        'category': fields.Str(),
        'value': fields.Str(),
    })
    @jwt_required
    @verify_admin_access
    @catch_exception
    def post(self, **kwargs):

        if len(self.db.get(self.db.tables["TaxonomyCategory"], {"name": kwargs["category"]})) == 0:
            return "", "422 The provided category does not exist"

        try:
            self.db.insert(
                {"name": kwargs["value"], "category": kwargs["category"]},
                self.db.tables["TaxonomyValue"]
            )
        except IntegrityError as e:
            self.db.session.rollback()
            if "Duplicate entry" in str(e):
                return "", "422 This value is already existing"
            raise e

        return "", "200 "
