from flask_restful import Resource
from db.db import DB
from decorator.catch_exception import catch_exception
from flask import request


class GetPublicCompanyGeolocations(Resource):

    def __init__(self, db: DB):
        self.db = db

    @catch_exception
    def get(self):

        c = self.db.tables["Company"]
        ca = self.db.tables["Company_Address"]
        entities = (c.id, )

        filters = request.args.to_dict()

        company_ids = [o.id for o in self.db.get_filtered_companies(filters, entities)]

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
