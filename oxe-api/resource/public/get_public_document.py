import os

from flask import send_file
from flask_apispec import MethodResource
from flask_apispec import doc
from flask_restful import Resource
from sqlalchemy.orm.exc import NoResultFound

from config.config import DOCUMENT_FOLDER
from db.db import DB
from decorator.catch_exception import catch_exception
from exception.document_not_found import DocumentNotFound


class GetPublicDocument(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @doc(tags=['public'],
         description='Get document from the media library. Accept the filename as a parameter',
         responses={
             "200": {},
             "422.a": {"description": "No document found with this filename"},
             "422.b": {"description": "Document not found"},
         })
    @catch_exception
    def get(self, filename_):

        try:
            document = self.db.session \
                .query(self.db.tables["Document"]) \
                .filter(self.db.tables["Document"].filename == filename_) \
                .one()
        except NoResultFound:
            return "", "422 No document found with this filename"

        try:
            f = open(os.path.join(DOCUMENT_FOLDER, str(document.id)), "rb")
        except FileNotFoundError:
            raise DocumentNotFound

        return send_file(
            f,
            attachment_filename=document.filename,
            mimetype=GetPublicDocument.get_mime_type(document.filename)
        )

    @staticmethod
    def get_mime_type(name):
        if name.lower().split(".")[-1] == "pdf":
            return "application/pdf"
        if name.lower().split(".")[-1] == "mp3":
            return "audio/mpeg"
        return "application/octet-stream"
