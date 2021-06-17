from flask_restful import Resource
from flask_apispec import MethodResource
from flask_jwt_extended import jwt_required
from exception.object_not_found import ObjectNotFound
from decorator.verify_admin_access import verify_admin_access
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from webargs import fields
from flask_apispec import use_kwargs, doc


class DeleteTaxonomyCategoryHierarchy(MethodResource, Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @doc(tags=['taxonomy'],
         description='Delete a taxonomy category hierarchy',
         responses={
             "200": {},
             "422": {"description": "Object not found"},
         })
    @use_kwargs({
        'parent_category': fields.Str(),
        'child_category': fields.Str(),
    })
    @jwt_required
    @verify_admin_access
    @catch_exception
    def post(self, **kwargs):

        row = {
            "parent_category": kwargs["parent_category"],
            "child_category": kwargs["child_category"]
        }

        values = self.db.get(self.db.tables["TaxonomyCategoryHierarchy"],  row)

        if len(values) > 0:
            self.db.delete(self.db.tables["TaxonomyCategoryHierarchy"], row)
        else:
            raise ObjectNotFound

        return "", "200 "
