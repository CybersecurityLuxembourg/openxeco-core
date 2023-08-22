import base64
import io
import traceback
import json

from flask import render_template
from PIL import Image
from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_jwt_extended import fresh_jwt_required, get_jwt_identity
from flask_restful import Resource
from sqlalchemy.orm.exc import NoResultFound
from webargs import fields

from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from utils.mail import send_email
from utils.env import get_admin_portal_url


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
         })
    @use_kwargs({
        'entity_id': fields.Int(required=False, allow_none=True),
        'request': fields.Str(),
        'type': fields.Str(required=False, allow_none=True),
        'data': fields.Dict(required=False, allow_none=True),
        'image': fields.Str(required=False, allow_none=True),
    })
    @fresh_jwt_required
    @catch_exception
    def post(self, **kwargs):

        # Control image

        image = None

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

        # Control rights on entity

        if "entity_id" in kwargs:
            try:
                self.db.session \
                    .query(self.db.tables["UserEntityAssignment"]) \
                    .with_entities(self.db.tables["UserEntityAssignment"].entity_id) \
                    .filter(self.db.tables["UserEntityAssignment"].user_id == get_jwt_identity()) \
                    .filter(self.db.tables["UserEntityAssignment"].entity_id == kwargs["entity_id"]) \
                    .one()
            except NoResultFound:
                return "", "422 Object not found or you don't have the required access to it"

        # Insert request

        user_request = {
            "user_id": int(get_jwt_identity()),
            "entity_id": kwargs["entity_id"] if "entity_id" in kwargs else None,
            "request": kwargs["request"],
            "type": kwargs["type"] if "type" in kwargs else None,
            "data": json.dumps(kwargs["data"]) if "data" in kwargs else None,
            "image": image,
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
                           url=get_admin_portal_url() + "/task?tab=request",
                           project_name=project_name)
                       )

        return "", "200 "
