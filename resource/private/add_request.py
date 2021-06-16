from flask_restful import Resource
from flask_apispec import MethodResource
import io
import base64
import traceback
from webargs import fields
from flask_apispec import use_kwargs, doc
from flask_jwt_extended import jwt_required, get_jwt_identity
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from PIL import Image
from sqlalchemy.orm.exc import NoResultFound


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
             "422.c": {"description": "Object not found or you don't have the required access to it"}
         })
    @use_kwargs({
        'company_id': fields.Int(required=False, allow_none=True),
        'request': fields.Str(),
        'type': fields.Str(required=False, allow_none=True),
        'data': fields.Dict(required=False, allow_none=True),
        'image': fields.Str(required=False, allow_none=True),
    })
    @jwt_required
    @catch_exception
    def post(self, **kwargs):

        image = None

        # Control image

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

        # Control rights on company

        if "company_id" in kwargs:
            try:
                self.db.session \
                    .query(self.db.tables["UserCompanyAssignment"]) \
                    .with_entities(self.db.tables["UserCompanyAssignment"].company_id) \
                    .filter(self.db.tables["UserCompanyAssignment"].user_id == get_jwt_identity()) \
                    .filter(self.db.tables["UserCompanyAssignment"].company_id == kwargs["company_id"]) \
                    .one()
            except NoResultFound:
                return "", "422 Object not found or you don't have the required access to it"

        # Insert request

        user_request = {
            "user_id": int(get_jwt_identity()),
            "company_id": kwargs["company_id"] if "company_id" in kwargs else None,
            "request": kwargs["request"],
            "type": kwargs["type"] if "type" in kwargs else None,
            "data": kwargs["data"] if "data" in kwargs else None,
            "image": image,
        }

        self.db.insert(user_request, self.db.tables["UserRequest"])

        return "", "200 "
