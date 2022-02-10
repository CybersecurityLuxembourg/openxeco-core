from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_restful import Resource
from webargs import fields

from db.db import DB
from decorator.catch_exception import catch_exception


class GetPublicCompanyGeolocations(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @doc(tags=['public'],
         description='Get the geolocations of the companies',
         responses={
             "200": {},
         })
    @use_kwargs({
        'ids': fields.DelimitedList(fields.Int(), required=False),
        'name': fields.Str(required=False),
        'ecosystem_role': fields.DelimitedList(fields.Str(), required=False),
        'entity_type': fields.DelimitedList(fields.Str(), required=False),
        'startup_only': fields.Bool(required=False),
        'corebusiness_only': fields.Bool(required=False),
        'taxonomy_values': fields.DelimitedList(fields.Str(), required=False),
        'include_inactive': fields.Bool(required=False),
    }, location="query")
    @catch_exception
    def get(self, **kwargs):

        c = self.db.tables["Company"]
        ca = self.db.tables["Company_Address"]
        entities = (c.id, )

        kwargs["status"] = ["ACTIVE", "INACTIVE"] \
            if "include_inactive" in kwargs and kwargs["include_inactive"] is True \
            else ["ACTIVE"]

        company_ids = [o.id for o in self.db.get_filtered_companies(kwargs, entities).all()]

        geolocations = self.db.session.query(ca) \
            .with_entities(ca.company_id, ca.latitude, ca.longitude) \
            .filter(ca.company_id.in_(company_ids)) \
            .filter(ca.latitude.isnot(None)) \
            .filter(ca.longitude.isnot(None)) \
            .all()

        geolocations = [g._asdict() for g in geolocations]

        for g in geolocations:
            g["latitude"] = float(g["latitude"])
            g["longitude"] = float(g["longitude"])

        return geolocations, "200 "
