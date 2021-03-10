from flask_restful import Resource
from db.db import DB
from decorator.catch_exception import catch_exception
from flask import request


class GetPublicCompanies(Resource):

    def __init__(self, db: DB):
        self.db = db

    @catch_exception
    def get(self):

        c = self.db.tables["Company"]
        entities = c.id, c.name, c.is_startup, c.is_cybersecurity_core_business, c.creation_date, c.image

        filters = request.args.to_dict()

        companies = [o._asdict() for o in self.db.get_filtered_companies(filters, entities)]

        for a in companies:
            a["creation_date"] = None if a["creation_date"] is None else str(a["creation_date"])

        return companies, "200 "
