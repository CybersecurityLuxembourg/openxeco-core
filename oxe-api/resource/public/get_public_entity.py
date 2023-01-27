from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_restful import Resource
from webargs import fields

from db.db import DB
from decorator.catch_exception import catch_exception
from exception.object_not_found import ObjectNotFound
from utils.response import build_no_cors_response


class GetPublicEntity(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @doc(tags=['public'],
         description='Get full information of an entity.'
                     'Only entities with those following status are accessible: ACTIVE, INACTIVE',
         responses={
             "200": {},
             "422": {"description": "Object not found"}
         })
    @use_kwargs({
        'include_assignments': fields.Bool(required=False, missing=False),
    }, location="query")
    @catch_exception
    def get(self, id_, **kwargs):

        c = self.db.tables["Entity"]
        entities = c.id, c.name, c.headline, c.legal_status, c.is_startup, c.is_cybersecurity_core_business, \
            c.trade_register_number, c.creation_date, c.description, c.website, c.image, c.status, c.linkedin_url, \
            c.twitter_url, c.youtube_url, c.discord_url, c.sync_node, c.sync_id, c.sync_global, c.sync_address, \
            c.sync_status
        data = [o._asdict() for o in self.db.get(c, {"id": id_, "status": ["ACTIVE", "INACTIVE"]}, entities)]

        if len(data) < 1:
            raise ObjectNotFound

        data = data[0]
        data["creation_date"] = None if data["creation_date"] is None else str(data["creation_date"])

        if kwargs["include_assignments"]:
            data["taxonomy_assignment"] = [v[0] for v in self.db.get(
                self.db.tables["TaxonomyAssignment"],
                {"entity_id": data['id']},
                [self.db.tables["TaxonomyAssignment"].taxonomy_value_id],
            )]

        return build_no_cors_response(data)
