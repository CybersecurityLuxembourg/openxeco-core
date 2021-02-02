from flask_restful import Resource
from flask_jwt_extended import jwt_required
from db.db import DB
from utils.serializer import Serializer
from exception.object_not_found import ObjectNotFound
from utils.catch_exception import catch_exception
from utils.log_request import log_request


class GetPublicCompany(Resource):

    def __init__(self, db: DB):
        self.db = db

    @catch_exception
    def get(self, id):

        c = self.db.tables["Company"]
        entities = c.id, c.name, c.is_startup, c.is_cybersecurity_core_business, c.rscl_number, c.creation_date, \
                   c.description, c.website
        data = [o._asdict() for o in self.db.get(c, {"id": id}, entities)]

        if len(data) < 1:
            raise ObjectNotFound

        data = data[0]
        data["creation_date"] = None if data["creation_date"] is None else str(data["creation_date"])

        return data, "200 "
