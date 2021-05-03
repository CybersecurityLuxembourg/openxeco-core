from flask_restful import Resource
from flask import request
import io
import base64
import traceback
from flask_jwt_extended import jwt_required, get_jwt_identity
from decorator.verify_payload import verify_payload
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from PIL import Image
from sqlalchemy.orm.exc import NoResultFound


class AddRequest(Resource):

    def __init__(self, db):
        self.db = db

    @log_request
    @verify_payload([
        {'field': 'company_id', 'type': int, 'nullable': True, 'optional': True},
        {'field': 'request', 'type': str},
        {'field': 'type', 'type': str, 'nullable': True, 'optional': True},
        {'field': 'data', 'type': [dict, list], 'nullable': True, 'optional': True},
        {'field': 'image', 'type': str, 'nullable': True, 'optional': True},
    ])
    @jwt_required
    @catch_exception
    def post(self):
        input_data = request.get_json()
        image = None

        # Control image

        if "image" in input_data and input_data["image"] is not None:
            try:
                image = base64.b64decode(input_data["image"].split(",")[-1])
                image_io = io.BytesIO(image)
                pil_image = Image.open(image_io)
            except Exception:
                traceback.print_exc()
                return "", "422 Impossible to read the image"

            if pil_image.size[0] > 500 or float(pil_image.size[1]) > 500:
                return "", "422 Image width and height can't be bigger than 500 pixels"

            image = base64.b64decode(input_data["image"].split(",")[-1])

        # Control rights on company

        if "company_id" in input_data:
            try:
                self.db.session \
                    .query(self.db.tables["UserCompanyAssignment"]) \
                    .with_entities(self.db.tables["UserCompanyAssignment"].company_id) \
                    .filter(self.db.tables["UserCompanyAssignment"].user_id == get_jwt_identity()) \
                    .filter(self.db.tables["UserCompanyAssignment"].company_id == input_data["company_id"]) \
                    .one()
            except NoResultFound:
                return "", f"422 Object not found or you don't have the required access to it"

        # Insert request

        user_request = {
            "user_id": int(get_jwt_identity()),
            "company_id": input_data["company_id"] if "company_id" in input_data else None,
            "request": input_data["request"],
            "type": input_data["type"] if "type" in input_data else None,
            "data": input_data["data"] if "data" in input_data else None,
            "image": image,
        }

        self.db.insert(user_request, self.db.tables["UserRequest"])

        return "", "200 "
