from flask_restful import Resource
from flask_apispec import MethodResource
from flask_jwt_extended import create_access_token
import datetime
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from flask_jwt_extended import jwt_refresh_token_required
from flask_jwt_extended import get_jwt_identity
from webargs import fields
from flask_apispec import use_kwargs, doc


class Refresh(MethodResource, Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @doc(tags=['account'],
         description='Request the token',
         responses={
             "200": {},
         })
    @use_kwargs({
        'refresh_token': fields.Str(),
    })
    @jwt_refresh_token_required
    @catch_exception
    def post(self):

        access_token_expires = datetime.timedelta(days=1)
        access_token = create_access_token(identity=get_jwt_identity(), expires_delta=access_token_expires, fresh=False)

        return {
            "access_token": access_token,
        }, "200 "
