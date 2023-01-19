from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_jwt_extended import jwt_required
from flask_restful import Resource
from sqlalchemy.exc import IntegrityError
from webargs import fields

from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access
from exception.cannot_assign_value_from_parent_category import CannotAssignValueFromParentCategory
from exception.object_not_found import ObjectNotFound


class AddTaxonomyAssignment(MethodResource, Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @doc(tags=['taxonomy'],
         description='Add a taxonomy assignment to an entity',
         responses={
             "200": {},
             "422": {"description": "This assignment is already existing"}
         })
    @use_kwargs({
        'entity_id': fields.Int(),
        'taxonomy_value_id': fields.Int(),
    })
    @jwt_required
    @verify_admin_access
    @catch_exception
    def post(self, **kwargs):

        taxonomy_value = self.db.get(self.db.tables["TaxonomyValue"], {"id": kwargs["taxonomy_value_id"]})

        if len(taxonomy_value) == 1:
            f = {"parent_category": taxonomy_value[0].category}
            ch = self.db.get(self.db.tables["TaxonomyCategoryHierarchy"], f)

            if len(ch) > 0:
                raise CannotAssignValueFromParentCategory
        else:
            raise ObjectNotFound

        if self.db.get_count(self.db.tables["TaxonomyAssignment"], kwargs) > 0:
            return "", "422 This assignment is already existing"

        try:
            self.db.insert(kwargs, self.db.tables["TaxonomyAssignment"])
        except IntegrityError as e:
            self.db.session.rollback()
            if "Duplicate entry" in str(e):
                return "422 This assignment is already existing"
            raise e

        return "", "200 "
