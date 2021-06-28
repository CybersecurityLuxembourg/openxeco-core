import os

from flask import send_file
from flask_apispec import MethodResource
from flask_apispec import doc
from flask_restful import Resource

from config.config import IMAGE_FOLDER
from db.db import DB
from decorator.catch_exception import catch_exception
from exception.image_not_found import ImageNotFound


class GetImage(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @doc(tags=['public'],
         description='Get image from the media library',
         responses={
             "200": {},
             "422.a": {"description": "Image not found"},
         })
    @catch_exception
    def get(self, id_):

        if id_.isdigit() or id_ in ["favicon.ico", "logo.jpg"]:
            try:
                f = open(os.path.join(IMAGE_FOLDER, id_), "rb")
            except FileNotFoundError:
                raise ImageNotFound

            if id_ == "favicon.ico":
                return send_file(f, attachment_filename=id_, mimetype='image/x-icon')
            elif id_ == "logo.jpg":
                return send_file(f, attachment_filename=id_, mimetype='image/JPG')
            else:
                return send_file(f, attachment_filename=f"{id_}.jpg", mimetype='image/JPG')
        else:
            return "", "422 The provided parameter mush be digits or 'favicon.ico' or 'logo.jpg'"
