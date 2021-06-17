from flask_restful import Resource
from flask_apispec import MethodResource
from flask_jwt_extended import jwt_required
from decorator.verify_admin_access import verify_admin_access
from decorator.catch_exception import catch_exception
from sqlalchemy.exc import IntegrityError
from exception.object_not_found import ObjectNotFound
from exception.cannot_assign_value_from_parent_category import CannotAssignValueFromParentCategory
from decorator.log_request import log_request
from webargs import fields
from flask_apispec import use_kwargs, doc


class AddTaxonomyAssignment(MethodResource, Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @doc(tags=['taxonomy'],
         description='Add a taxonomy assignment to a company',
         responses={
             "200": {},
             "422": {"description": "This assignment is already existing"}
         })
    @use_kwargs({
        'company': fields.Int(),
        'value': fields.Int(),
    })
    @jwt_required
    @verify_admin_access
    @catch_exception
    def post(self, **kwargs):

        taxonomy_value = self.db.get(self.db.tables["TaxonomyValue"], {"id": kwargs["value"]})

        if len(taxonomy_value) == 1:
            f = {"parent_category": taxonomy_value[0].category}
            ch = self.db.get(self.db.tables["TaxonomyCategoryHierarchy"], f)

            if len(ch) > 0:
                raise CannotAssignValueFromParentCategory
        else:
            raise ObjectNotFound

        row = {
            "company": kwargs["company"],
            "taxonomy_value": kwargs["value"]
        }

        if self.db.get_count(self.db.tables["TaxonomyAssignment"], row) > 0:
            return "", "422 This assignment is already existing"

        try:
            self.db.insert(row, self.db.tables["TaxonomyAssignment"])
        except IntegrityError as e:
            self.db.session.rollback()
            if "Duplicate entry" in str(e):
                return "422 This assignment is already existing"
            raise e

        return "", "200 "
