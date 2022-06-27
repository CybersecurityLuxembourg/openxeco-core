from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_restful import Resource
from webargs import fields
import base64
from PIL import Image
import PIL
import io
import traceback
import datetime
import os

from config.config import IMAGE_FOLDER
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from exception.object_not_found import ObjectNotFound
from exception.user_not_assign_to_company import UserNotAssignedToCompany
from exception.deactivated_article_edition import DeactivatedArticleEdition
from exception.article_type_not_allowed import ArticleTypeNotAllowed
from exception.error_while_saving_file import ErrorWhileSavingFile


class UpdateMyArticle(MethodResource, Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @doc(tags=['private'],
         description='Update an article editable by the user authenticated by the token',
         responses={
             "200": {},
             "403.1": {"description": "The article edition is deactivated"},
             "403.2": {"description": "The article type is not allowed"},
             "422.1": {"description": "Object not found : Article"},
             "422.2": {"description": "The article can only be modified by an admin"},
             "422.3": {"description": "The article has no company assigned"},
             "422.4": {"description": "The article has too much companies assigned"},
             "422.5": {"description": "The user is not assign to the company"},
             "422.6": {"description": "The article handle is already used"},
             "422.7": {"description": "The article status can't be set to 'PUBLIC'"},
             "422.8": {"description": "The article status can't be set to 'UNDER REVIEW'"},
             "422.9": {"description": "Impossible to read the image"},
             "422.10": {"description": "Image width and height can't be bigger than 500 pixels"},
             "500": {"description": "An error occurred while saving the file"},
         })
    @use_kwargs({
        'id': fields.Int(),
        'handle': fields.Str(required=False, allow_none=True),
        'title': fields.Str(required=False, allow_none=True),
        'abstract': fields.Str(required=False, allow_none=True, validate=lambda x: x is None or len(x) <= 500),
        'publication_date': fields.Str(required=False, allow_none=True),
        'start_date': fields.Str(required=False, allow_none=True),
        'end_date': fields.Str(required=False, allow_none=True),
        'status': fields.Str(required=False, allow_none=True),
        'type': fields.Str(required=False, allow_none=True),
        'external_reference': fields.Str(required=False, allow_none=True),
        'link': fields.Str(required=False, allow_none=True),
        'image': fields.Str(required=False, allow_none=True),
    })
    @jwt_required
    @catch_exception
    def post(self, **kwargs):

        settings = self.db.get(self.db.tables["Setting"])
        allowance_setting = [s for s in settings if s.property == "ALLOW_ECOSYSTEM_TO_EDIT_ARTICLE"]
        review_setting = [s for s in settings if s.property == "DEACTIVATE_REVIEW_ON_ECOSYSTEM_ARTICLE"]

        # Check if the functionality is allowed

        if len(allowance_setting) < 1 or allowance_setting[0].value != "TRUE":
            raise DeactivatedArticleEdition()

        # Check existence of objects

        articles = self.db.get(self.db.tables["Article"], {"id": kwargs["id"]})

        if len(articles) < 1:
            raise ObjectNotFound("Article")

        # Check if the article is not managed by an admin

        if articles[0].is_created_by_admin:
            return "", "422 The article can only be modified by an admin"

        # Check the company of the article

        article_companies = self.db.get(self.db.tables["ArticleCompanyTag"], {"article": kwargs["id"]})
        ret = self.check_article_companies(article_companies)

        if ret is not None:
            return ret

        # Check right of the user

        assignments = self.db.get(self.db.tables["UserCompanyAssignment"], {
            "user_id": get_jwt_identity(),
            "company_id": article_companies[0].company
        })

        if len(assignments) < 1:
            raise UserNotAssignedToCompany()

        # Valid values of properties

        ret = self.check_property_values(kwargs, settings, review_setting)

        if ret is not None:
            return ret

        # Save image

        ret = self.save_image(kwargs)

        if ret is not None:
            return ret

        # Modify article

        if len(review_setting) == 0 or review_setting[0].value != "TRUE":
            if articles[0].status == "PUBLIC":
                kwargs["status"] = "UNDER REVIEW"

        self.db.merge(kwargs, self.db.tables["Article"])

        return "", "200 "

    def save_image(self, kwargs):
        if "image" in kwargs and kwargs["image"] is not None:
            # Verify the image

            try:
                image = base64.b64decode(kwargs["image"].split(",")[-1])
                image_io = io.BytesIO(image)
                pil_image = Image.open(image_io)
            except Exception:
                traceback.print_exc()
                return "", "422 Impossible to read the image"

            if pil_image.size[0] > 500 or float(pil_image.size[1]) > 500:
                return "", "422 Image width and height can't be bigger than 500 pixels"

            # Generate the thumbnail

            thumbnail_stream = io.BytesIO(base64.b64decode(kwargs["image"].split(",")[-1]))
            fixed_height = 100
            thumbnail_image = Image.open(thumbnail_stream)
            height_percent = (fixed_height / float(thumbnail_image.size[1]))
            width_size = int((float(thumbnail_image.size[0]) * float(height_percent)))
            thumbnail = thumbnail_image.resize((width_size, fixed_height), PIL.Image.NEAREST)

            thumbnail_stream = io.BytesIO()
            thumbnail = thumbnail.convert("RGB")
            thumbnail.save(thumbnail_stream, format="JPEG")

            # Create and insert database object

            image_object = {
                "thumbnail": thumbnail_stream.getvalue(),
                "height": pil_image.size[1],
                "width": pil_image.size[0],
                "creation_date": datetime.date.today()
            }

            image_object = self.db.insert(image_object, self.db.tables["Image"])

            # Save the image

            stream = io.BytesIO(base64.b64decode(kwargs["image"].split(",")[-1]))

            try:
                f = open(os.path.join(IMAGE_FOLDER, str(image_object.id)), 'wb')
                f.write(stream.read())
                f.close()
            except Exception:
                self.db.delete(self.db.tables["Image"], {"id": image_object.id})
                traceback.print_exc()
                raise ErrorWhileSavingFile

            kwargs["image"] = image_object.id

        return None

    @staticmethod
    def check_article_companies(article_companies):
        if len(article_companies) < 1:
            return "", "422 The article has no company assigned"

        if len(article_companies) > 1:
            return "", "422 The article has too much companies assigned"

        return None

    def check_property_values(self, kwargs, settings, review_setting):
        if "type" in kwargs:
            type_setting = [s for s in settings if s.property == "AUTHORIZED_ARTICLE_TYPES_FOR_ECOSYSTEM"]

            if len(type_setting) < 1 or kwargs["type"] not in type_setting[0].value.split(","):
                raise ArticleTypeNotAllowed()

        if "handle" in kwargs:
            articles_with_same_handle = self.db.get(self.db.tables["Article"], {"handle": kwargs["handle"]})

            if len(articles_with_same_handle) > 0:
                return "", "422 The article handle is already used"

        if "status" in kwargs:
            if (len(review_setting) == 0 or review_setting[0].value != "TRUE") and kwargs["status"] == "PUBLIC":
                return "", "422 The article status can't be set to 'PUBLIC'"

            if len(review_setting) > 0 and review_setting[0].value == "TRUE" and kwargs["status"] == "UNDER REVIEW":
                return "", "422 The article status can't be set to 'UNDER REVIEW'"

        return None
