import datetime
import os
import traceback

from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_jwt_extended import jwt_required
from flask_restful import Resource
from webargs import fields
from sqlalchemy.exc import IntegrityError

from config.config import DOCUMENT_FOLDER
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access
from exception.error_while_saving_file import ErrorWhileSavingFile
from utils.serializer import Serializer


class AddDocument(MethodResource, Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @doc(tags=['media'],
         description='Add a document to the media library. Return a dictionary with the data of the new object',
         responses={
             "200": {},
             "422": {"description": "A document is already existing with that filename"},
         })
    @use_kwargs({
        'filename': fields.Str(),
        'data': fields.Str(),
    })
    @jwt_required
    @verify_admin_access
    @catch_exception
    def post(self, **kwargs):

        # Create object to save

        document = {
            "filename": kwargs["filename"],
            "size": len(kwargs["data"]),
            "creation_date": datetime.date.today()
        }

        try:
            document = self.db.insert(document, self.db.tables["Document"])
        except IntegrityError as e:
            self.db.session.rollback()
            if "Duplicate entry" in str(e):
                return "", "422 A document is already existing with that filename"
            raise e

        # Save file in dir

        try:
            f = open(os.path.join(DOCUMENT_FOLDER, str(document.id)), 'wb')
            f.write(kwargs["data"].encode('latin-1'))
            f.close()
        except Exception:
            self.db.delete(self.db.tables["Document"], {"id": document.id})
            traceback.print_exc()
            raise ErrorWhileSavingFile

        return Serializer.serialize(document, self.db.tables["Document"]), "200 "
