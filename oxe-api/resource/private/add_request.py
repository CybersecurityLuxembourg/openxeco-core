import base64
import datetime
import io
import os
import traceback
import json

from flask import request, render_template
from PIL import Image
from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_restful import Resource
from sqlalchemy.orm.exc import NoResultFound
from webargs import fields

from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from config.config import DOCUMENT_FOLDER
from exception.error_while_saving_file import ErrorWhileSavingFile
from utils.mail import send_email


class AddRequest(MethodResource, Resource):

    def __init__(self, db, mail):
        self.db = db
        self.mail = mail

    @log_request
    @doc(tags=['private'],
         description='Add a request under the name of the requesting user',
         responses={
             "200": {},
             "422.a": {"description": "Impossible to read the image"},
             "422.b": {"description": "Image width and height can't be bigger than 500 pixels"},
             "422.c": {"description": "Object not found or you don't have the required access to it"},
             "422.d": {"description": "Already exists"},
             "500": {"description": "Impossible to find the origin. Please contact the administrator"}
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

        if "data" in kwargs:
            if "vat_number" in kwargs["data"]:
                data = self.db.get(self.db.tables["Entity"], {"vat_number": kwargs["data"]["vat_number"]})
                if len(data) > 0:
                    return "", "422 The VAT Number you entered has already been registered"
        if 'HTTP_ORIGIN' in request.environ and request.environ['HTTP_ORIGIN']:
            origin = request.environ['HTTP_ORIGIN']
        else:
            return "", "500 Impossible to find the origin. Please contact the administrator"

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

            old_document = self.db.get(self.db.tables["Document"], { "filename": filename })
            if len(old_document) > 0:
                self.db.delete(self.db.tables["Document"], { "filename": filename })
            document = self.db.insert(document, self.db.tables["Document"])

            try:
                decoded_data = base64.b64decode(kwargs["uploaded_file"].split(",")[-1])
            except Exception:
                traceback.print_exc()
                return "", "422 Impossible to read the file"
            try:
                f = open(os.path.join(DOCUMENT_FOLDER,  str(document.id)), 'wb')
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

        if kwargs["type"] == "NEW INDIVIDUAL ACCOUNT":
            data = self.db.get(self.db.tables["User"], {"id": get_jwt_identity()})
            if len(data) == 0:
                return "", "401 The user has not been found"

            user_check = self.db.get(self.db.tables["UserRequest"], {
                "user_id": get_jwt_identity(),
                "type": "NEW INDIVIDUAL ACCOUNT"
            })
            if len(user_check) > 0:
                return "", "401 You have already submitted your profile for review"

            user = data[0]
            user.status = "REQUESTED"
            self.db.merge(user, self.db.tables["User"])

        if kwargs["type"] == "ENTITY ASSOCIATION CLAIM":
            assignments = self.db.get(self.db.tables["UserEntityAssignment"], {
                "user_id": get_jwt_identity(),
                "entity_id": kwargs["data"]["entity_id"]
            })
            if len(assignments) > 0:
                return "", "401 You are already associated with this entity"


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

        # Get email addresses to send notification

        addresses = self.db.session \
            .query(self.db.tables["User"]) \
            .with_entities(self.db.tables["User"].email) \
            .filter(self.db.tables["User"].is_admin.is_(True)) \
            .filter(self.db.tables["User"].is_active.is_(True)) \
            .filter(self.db.tables["User"].accept_request_notification.is_(True)) \
            .all()
        print(addresses)
        addresses = [a[0] for a in addresses]

        # Send notification email

        if len(addresses) > 0:
            pj_settings = self.db.get(self.db.tables["Setting"], {"property": "PROJECT_NAME"})
            project_name = pj_settings[0].value if len(pj_settings) > 0 else ""

            send_email(self.mail,
                       subject=f"[{project_name}] New request",
                       recipients=addresses,
                       html_body=render_template(
                           'request_notification.html',
                           url=origin.replace("community.", "admin.") + "/task?tab=request",
                           project_name=project_name)
                       )

        return "", "200 "
