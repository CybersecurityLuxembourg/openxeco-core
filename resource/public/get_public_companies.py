from flask import request
from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_restful import Resource
from webargs import fields

from db.db import DB
from decorator.catch_exception import catch_exception


class GetPublicCompanies(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @doc(tags=['public'],
         description='Get the full list of companies. The request returns a restricted amount of information '
                     '(id, name, is_startup, is_cybersecurity_core_business, creation_date, image)',
         responses={
             "200": {},
         })
    @use_kwargs({
        'name': fields.Str(required=False),
        'ecosystem_role': fields.DelimitedList(fields.Str(), required=False),
        'entity_type': fields.DelimitedList(fields.Str(), required=False),
        'startup_only': fields.Str(required=False, validate=lambda x: x == "true"),
        'corebusiness_only': fields.Str(required=False, validate=lambda x: x == "true"),
        'taxonomy_values': fields.DelimitedList(fields.Str(), required=False),
    }, location="query")
    @catch_exception
    def get(self, **kwargs):

        c = self.db.tables["Company"]
        entities = c.id, c.name, c.is_startup, c.is_cybersecurity_core_business, c.creation_date, c.image

        companies = [o._asdict() for o in self.db.get_filtered_companies(kwargs, entities)]

        for a in companies:
            a["creation_date"] = None if a["creation_date"] is None else str(a["creation_date"])

        return companies, "200 "
