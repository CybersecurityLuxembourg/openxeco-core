import base64
import datetime
import io
import os
import traceback
import json

from PIL import Image
from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_restful import Resource
from sqlalchemy.orm.exc import NoResultFound
from webargs import fields
from sqlalchemy.exc import IntegrityError

from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from config.config import DOCUMENT_FOLDER
from exception.error_while_saving_file import ErrorWhileSavingFile


class AddRequest(MethodResource, Resource):

    def __init__(self, db):
        self.db = db

    @log_request
    @doc(tags=['private'],
         description='Add a request under the name of the requesting user',
         responses={
             "200": {},
             "422.a": {"description": "Impossible to read the image"},
             "422.b": {"description": "Image width and height can't be bigger than 500 pixels"},
             "422.c": {"description": "Object not found or you don't have the required access to it"},
             "422.d": {"description": "Already exists"},
         })
    @use_kwargs({
        'entity_id': fields.Int(required=False, allow_none=True),
        'request': fields.Str(),
        'type': fields.Str(required=False, allow_none=True),
        'data': fields.Dict(required=False, allow_none=True),
        'image': fields.Str(),
        'uploaded_file': fields.Str(),
    })
    @jwt_required
    @catch_exception
    def post(self, **kwargs):

        image = None
        file = None
        user_id = get_jwt_identity()
        # Control image

        if "vat_number" in kwargs["data"]:
            data = self.db.get(self.db.tables["Entity"], {"vat_number": kwargs["data"]["vat_number"]})
            if len(data) > 0:
                return "", "422 The VAT Number you entered has already been registered"

        if "image" in kwargs and kwargs["image"] is not None:
            try:
                image = base64.b64decode(kwargs["image"].split(",")[-1])
                image_io = io.BytesIO(image)
                pil_image = Image.open(image_io)
            except Exception:
                traceback.print_exc()
                return "", "422 Impossible to read the image"

            if pil_image.size[0] > 500 or float(pil_image.size[1]) > 500:
                return "", "422 Image width and height can't be bigger than 500 pixels"

            image = base64.b64decode(kwargs["image"].split(",")[-1])

        if "uploaded_file" in kwargs and kwargs["uploaded_file"] is not None:
            filename = f"entity_registration_approval_{user_id}_{kwargs['data']['vat_number']}.pdf"
            document = {
                "filename": filename,
                "size": len(kwargs["uploaded_file"]),
                "creation_date": datetime.date.today()
            }
            try:
                self.db.insert(document, self.db.tables["Document"])
            except IntegrityError as e:
                self.db.session.rollback()
                if "Duplicate entry" in str(e):
                    return "", "422 A document is already existing with that filename"
                raise e
            try:
                decoded_data = base64.b64decode(kwargs["uploaded_file"].split(",")[-1])
            except Exception:
                traceback.print_exc()
                return "", "422 Impossible to read the file"
            try:
                f = open(os.path.join(DOCUMENT_FOLDER, filename), 'wb')
                f.write(decoded_data)
                f.close()
                file = filename
            except Exception:
                traceback.print_exc()
                raise ErrorWhileSavingFile

        # Control rights on entity

        if "entity_id" in kwargs:
            try:
                self.db.session \
                    .query(self.db.tables["UserEntityAssignment"]) \
                    .with_entities(self.db.tables["UserEntityAssignment"].entity_id) \
                    .filter(self.db.tables["UserEntityAssignment"].user_id == user_id) \
                    .filter(self.db.tables["UserEntityAssignment"].entity_id == kwargs["entity_id"]) \
                    .one()
            except NoResultFound:
                return "", "422 Object not found or you don't have the required access to it"

        # Insert request
        user_request = {
            "user_id": int(user_id),
            "entity_id": kwargs["entity_id"] if "entity_id" in kwargs else None,
            "request": kwargs["request"],
            "type": kwargs["type"] if "type" in kwargs else None,
            "data": json.dumps(kwargs["data"]) if "data" in kwargs else None,
            "image": image,
            "file": file,
        }

        self.db.insert(user_request, self.db.tables["UserRequest"])

        if kwargs["type"] == "NEW INDIVIDUAL ACCOUNT":
            data = self.db.get(self.db.tables["User"], {"id": get_jwt_identity()})
            if len(data) == 0:
                return "", "401 The user has not been found"
            user = data[0]
            user.status = "REQUESTED"
            self.db.merge(user, self.db.tables["User"])

        return "", "200 "
