from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_jwt_extended import fresh_jwt_required
from flask_restful import Resource
from sqlalchemy.exc import IntegrityError
from webargs import fields

from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access


class AddTaxonomyValueHierarchy(MethodResource, Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @doc(tags=['taxonomy'],
         description='Add a taxonomy value hierarchy',
         responses={
             "200": {},
             "422a": {"description": "The provided values cannot be the same one"},
             "422b": {"description": "Provided parent value not existing"},
             "422c": {"description": "Provided child value not existing"},
             "422d": {"description": "Hierarchy between the categories of the values does not exist"},
             "422e": {"description": "This relation is already existing"},
         })
    @use_kwargs({
        'parent_value': fields.Int(),
        'child_value': fields.Int(),
    })
    @fresh_jwt_required
    @verify_admin_access
    @catch_exception
    def post(self, **kwargs):

        if kwargs["parent_value"] == kwargs["child_value"]:
            return "", "422 The provided values cannot be the same one"

        # Verification of the values

        pv = self.db.get(self.db.tables["TaxonomyValue"], {"id": kwargs["parent_value"]})
        cv = self.db.get(self.db.tables["TaxonomyValue"], {"id": kwargs["child_value"]})

        if len(pv) == 0:
            return "", "422 Provided parent value not existing"
        if len(cv) == 0:
            return "", "422 Provided child value not existing"

        # Verification that the hierarchy is correct

        hierarchy = self.db.get(
            self.db.tables["TaxonomyCategoryHierarchy"],
            {"parent_category": pv[0].category, "child_category": cv[0].category}
        )

        if len(hierarchy) == 0:
            return "", "422 Hierarchy between the categories of the values does not exist"

        # Add the row

        row = {
            "parent_value": kwargs["parent_value"],
            "child_value": kwargs["child_value"]
        }

        try:
            self.db.insert(row, self.db.tables["TaxonomyValueHierarchy"])
        except IntegrityError as e:
            self.db.session.rollback()
            if "Duplicate entry" in str(e):
                return "", "422 This relation is already existing"
            raise e

        return "", "200 "
