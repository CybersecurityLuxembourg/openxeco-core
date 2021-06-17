from flask_restful import Resource
from flask_apispec import MethodResource
from db.db import DB
from decorator.catch_exception import catch_exception
from flask_apispec import use_kwargs, doc
from webargs import fields


class GetPublicCompanyGeolocations(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @doc(tags=['public'],
         description='Get the geolocations of the companies',
         responses={
             "200": {},
         })
    @use_kwargs({
        'name': fields.Str(required=False),
        'ecosystem_role': fields.List(fields.Str(), required=False),
        'entity_type': fields.List(fields.Str(), required=False),
        'startup_only': fields.Str(required=False, validate=lambda x: x == "true"),
        'corebusiness_only': fields.Str(required=False, validate=lambda x: x == "true"),
        'taxonomy_values': fields.List(fields.Str(), required=False),
    })
    @catch_exception
    def get(self, **kwargs):

        c = self.db.tables["Company"]
        ca = self.db.tables["Company_Address"]
        entities = (c.id, )

        company_ids = [o.id for o in self.db.get_filtered_companies(kwargs, entities)]

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
