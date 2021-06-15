from flask_restful import Resource
from flask_apispec import MethodResource
from db.db import DB
from decorator.catch_exception import catch_exception
from flask import send_file
from config.config import IMAGE_FOLDER
import os
from exception.image_not_found import ImageNotFound


class GetImage(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @catch_exception
    def get(self, id_):

        try:
            f = open(os.path.join(IMAGE_FOLDER, id_), "rb")
        except FileNotFoundError:
            raise ImageNotFound

        return send_file(f, attachment_filename=f"{id_}.jpg", mimetype='image/JPG')
