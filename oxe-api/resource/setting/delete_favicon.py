import os

from flask_apispec import MethodResource
from flask_apispec import doc
from flask_jwt_extended import fresh_jwt_required
from flask_restful import Resource

from config.config import IMAGE_FOLDER
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access


class DeleteFavicon(MethodResource, Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @doc(tags=['setting'],
         description='Delete favicon of the project if exists.'
                     'Note: the default favicon is then applied to the project.',
         responses={
             "200": {},
             "422": {"description": "There is no favicon defined for this project"},
         })
    @fresh_jwt_required
    @verify_admin_access
    @catch_exception
    def post(self):

        if os.path.exists(os.path.join(IMAGE_FOLDER, "favicon.ico")):
            os.remove(os.path.join(IMAGE_FOLDER, "favicon.ico"))
        else:
            return "", "422 There is no favicon defined for this project"

        return "", "200 "
