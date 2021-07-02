from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_jwt_extended import jwt_required
from flask_restful import Resource
from sqlalchemy.exc import IntegrityError
from webargs import fields

from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access


class AddTaxonomyCategoryHierarchy(MethodResource, Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @doc(tags=['taxonomy'],
         description='Add a taxonomy category hierarchy',
         responses={
             "200": {},
             "422.a": {"description": "The provided categories cannot be the same one"},
             "422.b": {"description": "One of the provided category does not exist"},
             "422.c": {"description": "This relation is already existing"}
         })
    @use_kwargs({
        'parent_category': fields.Str(),
        'child_category': fields.Str(),
    })
    @jwt_required
    @verify_admin_access
    @catch_exception
    def post(self, **kwargs):

        if kwargs["parent_category"] == kwargs["child_category"]:
            return "", "422 The provided categories cannot be the same one"

        if len(self.db.get(
                self.db.tables["TaxonomyCategory"],
                {"name": [kwargs["parent_category"], kwargs["child_category"]]}
        )) < 2:
            return "", "422 One of the provided category does not exist"

        try:
            self.db.insert(
                {"parent_category": kwargs["parent_category"], "child_category": kwargs["child_category"]},
                self.db.tables["TaxonomyCategoryHierarchy"]
            )
        except IntegrityError as e:
            self.db.session.rollback()
            if "Duplicate entry" in str(e):
                return "", "422 This relation is already existing"
            raise e

        return "", "200 "
