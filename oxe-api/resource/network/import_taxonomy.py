from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_jwt_extended import jwt_required
from flask_restful import Resource
from webargs import fields
from copy import deepcopy
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
        'sync_global': fields.Bool(required=False, missing=False),
        'sync_values': fields.Bool(required=False, missing=False),
        'sync_hierarchy': fields.Bool(required=False, missing=False),
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
            taxonomy = request.get_request(node.api_endpoint + "/public/get_public_taxonomy")
        except Exception:
            return "", "500 Error while fetching the network node taxonomy"

        taxonomy = json.loads(taxonomy)

        # Get the correct taxonomy category to import

        category = [c for c in taxonomy["categories"] if c["name"] == kwargs["taxonomy_category"]]

        if len(category) > 0:
            category = category[0]
        else:
            raise ObjectNotFound("Taxonomy category on target node")

        # Create the taxonomy category

        self.create_category_and_values(taxonomy, category, **kwargs)

        # Create the hierarchy

        if kwargs["sync_hierarchy"]:
            categories_to_check = [kwargs["taxonomy_category"]]
            created_categories = [kwargs["taxonomy_category"]]

            while len(categories_to_check) > 0:
                c = categories_to_check.pop()
                parents = [h["parent_category"] for h in taxonomy["category_hierarchy"]
                           if h["child_category"] == c and h["parent_category"] not in created_categories]
                children = [h["child_category"] for h in taxonomy["category_hierarchy"]
                            if h["parent_category"] == c and h["child_category"] not in created_categories]
                categories_to_check = categories_to_check + parents + children

                if c != kwargs["taxonomy_category"]:
                    category = [t for t in taxonomy["categories"] if t["name"] == c][0]
                    self.create_category_and_values(taxonomy, category, **kwargs)
                    created_categories.append(c)
            
            category_hierarchy = [h for h in taxonomy["category_hierarchy"]
                                  if h["child_category"] in created_categories
                                  and h["parent_category"] in created_categories]
            
            for h in category_hierarchy:
                self.create_hierarchy(taxonomy, h)

        self.db.session.commit()

        return "", "200 "

    def create_category_and_values(self, taxonomy, category, **kwargs):
        # Insert category

        category = {
            **category,
            **{
                "sync_node": kwargs["network_node_id"],
                "sync_global": kwargs["sync_global"],
                "sync_values": kwargs["sync_values"],
                "sync_hierarchy": kwargs["sync_hierarchy"],
                "sync_status": "OK",
            },
        }

        category = self.db.insert(category, self.db.tables["TaxonomyCategory"], commit=False, flush=True)

        # Clean and insert values

        values = [deepcopy(v) for v in taxonomy["values"] if v["category"] == category.name]

        for v in values:
            del v["id"]

        self.db.insert(values, self.db.tables["TaxonomyValue"], commit=False, flush=True)

    def create_hierarchy(self, taxonomy, hierarchy):
        # Insert category hierarchy

        self.db.insert(hierarchy, self.db.tables["TaxonomyCategoryHierarchy"], commit=False, flush=True)

        # Insert value hierarchy

        parent_values = [v for v in taxonomy["values"] if v["category"] == hierarchy["parent_category"]]
        child_values = [v for v in taxonomy["values"] if v["category"] == hierarchy["child_category"]]

        local_parent_values = self.db.get(self.db.tables["TaxonomyValue"], {"category": hierarchy["parent_category"]})
        local_child_values = self.db.get(self.db.tables["TaxonomyValue"], {"category": hierarchy["child_category"]})

        value_hierarchy = [h for h in taxonomy["value_hierarchy"]
                           if h["parent_value"] in [v["id"] for v in parent_values]
                           and h["child_value"] in [v["id"] for v in child_values]]
        local_value_hierarchy = []

        for h in value_hierarchy:
            parent_value = [v for v in parent_values if v["id"] == h["parent_value"]][0]
            local_parent_value = [v for v in local_parent_values if v.name == parent_value["name"]
                                  and v.category == hierarchy["parent_category"]][0]

            child_value = [v for v in child_values if v["id"] == h["child_value"]][0]
            local_child_value = [v for v in local_child_values if v.name == child_value["name"]
                                  and v.category == hierarchy["child_category"]][0]

            h["parent_value"] = local_parent_value.id
            h["child_value"] = local_child_value.id
            local_value_hierarchy.append(h)

        self.db.insert(local_value_hierarchy, self.db.tables["TaxonomyValueHierarchy"], commit=False, flush=True)
