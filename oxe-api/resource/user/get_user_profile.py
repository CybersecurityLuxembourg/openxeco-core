from flask_apispec import MethodResource
from flask_apispec import doc
from flask_jwt_extended import jwt_required
from flask_restful import Resource

from db.db import DB
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access


class GetUserProfile(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @doc(tags=['private'],
         description='Get a user profile by user ID',
         responses={
             "200": {},
             "401": {"description": "Unauthorized"},
             "422": {"description": "Object not found"}
         })
    @jwt_required
    @verify_admin_access
    @catch_exception
    def get(self, user_id):
        user = self.db.get(self.db.tables["User"], {"id": user_id})
        if len(user) == 0:
            return "", "401 The user has not been found"
        user = user[0].__dict__
        del user["password"]
        del user['_sa_instance_state']

        profile = self.db.get(self.db.tables["UserProfile"], {"user_id": user_id})
        if len(profile) > 0:
            profile = profile[0].__dict__
            del profile['_sa_instance_state']
            del profile['id']
        else:
            profile = {}

        return {**user, **profile}, "200 "
