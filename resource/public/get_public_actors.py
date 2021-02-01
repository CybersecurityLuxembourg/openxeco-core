from flask_restful import Resource
from db.db import DB
from utils.catch_exception import catch_exception


class GetPublicActors(Resource):

    def __init__(self, db: DB):
        self.db = db

    @catch_exception
    def get(self):

        c = self.db.tables["Company"]

        actors = [o._asdict() for o in self.db.session.query(c)
                .with_entities(c.id, c.name, c.is_startup, c.is_cybersecurity_core_business, c.creation_date)
                .filter(c.type == "ACTOR")
                .all()]

        for a in actors:
            a["creation_date"] = None if a["creation_date"] is None else str(a["creation_date"])

        return actors, "200 "
