from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_jwt_extended import jwt_required
from flask_restful import Resource
from webargs import fields
import json

from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access
from exception.object_already_existing import ObjectAlreadyExisting
from exception.object_not_found import ObjectNotFound
from utils import request


class ImportTaxonomy(MethodResource, Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @doc(tags=['network'],
         description='Import a taxonomy from a network node',
         responses={
             "200": {},
             "422.a": {"description": "Object already existing: Taxonomy category with this name"},
             "422.b": {"description": "Object not found: Network node"},
             "422.c": {"description": "Object not found: Taxonomy category on target node"},
             "500": {"description": "Error while fetching the network node taxonomy"},
         })
    @use_kwargs({
        'network_node_id': fields.Int(),
        'taxonomy_category': fields.Str(),
        'sync_hierarchy': fields.Bool(required=False),
    })
    @jwt_required
    @verify_admin_access
    @catch_exception
    def post(self, **kwargs):

        # Check if the category is not existing

        categories = self.db.get(self.db.tables["TaxonomyCategory"], {"name": kwargs["taxonomy_category"]})

        if len(categories) > 0:
            raise ObjectAlreadyExisting("Taxonomy category with this name")

        # Fetch the taxonomies from the network node

        try:
            node = self.db.get_by_id(kwargs["network_node_id"], self.db.tables["NetworkNode"])
        except Exception:
            raise ObjectNotFound("Network node")

        try:
            node_taxonomy = request.get_request(node.api_endpoint + "/public/get_public_taxonomy")
        except Exception:
            return "", "500 Error while fetching the network node taxonomy"

        node_taxonomy = json.loads(node_taxonomy)

        # Get the correct taxonomy category to import

        category = [c for c in node_taxonomy["categories"] if c["name"] == kwargs["taxonomy_category"]]

        if len(category) > 0:
            category = category[0]
        else:
            raise ObjectNotFound("Taxonomy category on target node")

        # Create the taxonomy category

        self.create_category_and_values(node_taxonomy, category, **kwargs)

        # Create the hierarchy

        if kwargs["sync_hierarchy"]:
            # TODO
            pass

        self.db.session.commit()

        return "", "200 "

    def create_category_and_values(self, taxonomy, category, **kwargs):
        # Insert category

        category = {
            **category,
            **{
                "sync_node": kwargs["network_node_id"],
                "sync_global": True,
                "sync_values": True,
                "sync_hierarchy": kwargs["sync_hierarchy"],
                "sync_status": "OK",
            },
        }

        category = self.db.insert(category, self.db.tables["TaxonomyCategory"], commit=False)

        # Insert values

        values = [v for v in taxonomy["values"] if v["category"] == category.name]
        self.db.insert(values, self.db.tables["TaxonomyValue"], commit=False)

    def create_hierarchy(self, taxonomy, category, **kwargs):
        # Insert category hierarchy

        category = {
            **category,
            **{
                "sync_node": kwargs["network_node_id"],
                "sync_global": True,
                "sync_values": True,
                "sync_hierarchy": kwargs["sync_hierarchy"],
                "sync_status": "OK",
            },
        }

        category = self.db.insert(category, self.db.tables["TaxonomyCategory"], commit=False)

        # Insert values hierarchy

        values = [v for v in taxonomy.values if v.category == category.name]
        self.db.insert(values, self.db.tables["TaxonomyCategory"], commit=False)
