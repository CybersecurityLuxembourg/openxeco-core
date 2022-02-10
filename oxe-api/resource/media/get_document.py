from flask_apispec import MethodResource
from flask_apispec import doc
from flask_jwt_extended import jwt_required
from flask_restful import Resource
from sqlalchemy import or_

from db.db import DB
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access
from utils.serializer import Serializer
from exception.object_not_found import ObjectNotFound


class GetDocument(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @doc(tags=['media'],
         description='Get a document object from the media library by its filename or ID',
         responses={
             "200": {},
             "422": {"description": "Object not found"},
         })
    @jwt_required
    @verify_admin_access
    @catch_exception
    def get(self, id_):

        data = self.db.session.query(self.db.tables["Document"]) \
            .filter(or_(self.db.tables["Document"].id == id_,
                        self.db.tables["Document"].filename == id_)) \
            .all()

        if len(data) < 1:
            raise ObjectNotFound

        data = Serializer.serialize(data, self.db.tables["Document"])

        return data[0], "200 "
