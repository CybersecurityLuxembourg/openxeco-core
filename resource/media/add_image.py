from flask_restful import Resource
from flask import request
from flask_jwt_extended import jwt_required
from decorator.log_request import log_request
from decorator.verify_payload import verify_payload
from decorator.verify_admin_access import verify_admin_access
from decorator.catch_exception import catch_exception
import datetime
from PIL import Image
import os
import PIL
import io
import base64
from config.config import IMAGE_FOLDER
import traceback
from exception.error_while_saving_file import ErrorWhileSavingFile
from utils.serializer import Serializer


class AddImage(Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @verify_payload([
        {'field': 'image', 'type': str}
    ])
    @jwt_required
    @verify_admin_access
    @catch_exception
    def post(self):
        input_data = request.get_json()

        thumbnail_stream = io.BytesIO(base64.b64decode(input_data["image"].split(",")[-1]))

        # Create Thumbnail file

        fixed_height = 100
        image = Image.open(thumbnail_stream)
        height_percent = (fixed_height / float(image.size[1]))
        width_size = int((float(image.size[0]) * float(height_percent)))
        thumbnail = image.resize((width_size, fixed_height), PIL.Image.NEAREST)

        thumbnail_stream = io.BytesIO()
        thumbnail = thumbnail.convert("RGB")
        thumbnail.save(thumbnail_stream, format="JPEG")

        # Create object to save

        image = {
            "thumbnail": thumbnail_stream.getvalue(),
            "height": image.size[1],
            "width": image.size[0],
            "creation_date": datetime.date.today()
        }

        image = self.db.insert(image, self.db.tables["Image"])

        # Save file in dir

        stream = io.BytesIO(base64.b64decode(input_data["image"].split(",")[-1]))

        try:
            f = open(os.path.join(IMAGE_FOLDER, str(image.id)), 'wb')
            f.write(stream.read())
            f.close()
        except Exception:
            self.db.delete(self.db.tables["Image"], {"id": image.id})
            traceback.print_exc()
            raise ErrorWhileSavingFile

        return Serializer.serialize(image, self.db.tables["Image"]), "200 "
