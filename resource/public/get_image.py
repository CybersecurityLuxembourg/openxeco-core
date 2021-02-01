from flask_restful import Resource
from db.db import DB
from utils.catch_exception import catch_exception
from flask import send_file
from config.config import IMAGE_FOLDER
import os
from exception.image_not_found import ImageNotFound


class GetImage(Resource):

    def __init__(self, db: DB):
        self.db = db

    @catch_exception
    def get(self, id):

        try:
            f = open(os.path.join(IMAGE_FOLDER, id), "rb")
        except FileNotFoundError as e:
            raise ImageNotFound

        return send_file(f, attachment_filename=f"{id}.jpg", mimetype='image/JPG')
