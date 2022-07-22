from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_restful import Resource
from webargs import fields

from db.db import DB
from decorator.catch_exception import catch_exception
from utils.response import build_no_cors_response


class GetPublicCompanies(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @doc(tags=['public'],
         description='Get the list or the count of public entities.\n\n'
                     'Entities with the INACTIVE status are not in the list by default, '
                     'please see the "include_inactive" parameter.\n\n'
                     'The request returns a restricted amount of information '
                     '(id, name, legal_status, is_startup, is_cybersecurity_core_business, '
                     'creation_date, image, status)',
         responses={
             "200": {},
         })
    @use_kwargs({
        'ids': fields.DelimitedList(fields.Int(), required=False),
        'name': fields.Str(required=False),
        'legal_status': fields.DelimitedList(fields.Str(
            validate=lambda x: x in ['JURIDICAL PERSON', 'NATURAL PERSON', 'OTHER'],
            required=False,
        )),
        'startup_only': fields.Bool(required=False),
        'corebusiness_only': fields.Bool(required=False),
        'taxonomy_values': fields.DelimitedList(fields.Str(), required=False),
        'include_inactive': fields.Bool(required=False),
        'count': fields.Bool(required=False),
    }, location="query")
    @catch_exception
    def get(self, **kwargs):

        c = self.db.tables["Company"]

        kwargs["status"] = ["ACTIVE", "INACTIVE"] \
            if "include_inactive" in kwargs and kwargs["include_inactive"] is True \
            else ["ACTIVE"]

        if "count" in kwargs and kwargs["count"] is True:
            response = {"count": self.db.get_filtered_companies(kwargs).count()}
        else:
            entities = c.id, c.name, c.legal_status, c.is_startup, c.is_cybersecurity_core_business, \
                c.trade_register_number, c.creation_date, c.description, c.website, c.image, c.status, c.linkedin_url, \
                c.twitter_url, c.youtube_url, c.discord_url, c.sync_node, c.sync_id, c.sync_global, c.sync_address, \
                c.sync_status

            response = [o._asdict() for o in self.db.get_filtered_companies(kwargs, entities).all()]

            for a in response:
                a["creation_date"] = None if a["creation_date"] is None else str(a["creation_date"])

        return build_no_cors_response(response)
