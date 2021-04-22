from flask_restful import Resource
from flask_jwt_extended import create_access_token
import datetime
from decorator.verify_payload import verify_payload
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from flask_jwt_extended import jwt_refresh_token_required
from flask_jwt_extended import get_jwt_identity


class Refresh(Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @verify_payload([
        {'field': 'refresh_token', 'type': str},
    ])
    @jwt_refresh_token_required
    @catch_exception
    def post(self):

        access_token_expires = datetime.timedelta(days=1)
        access_token = create_access_token(identity=get_jwt_identity(), expires_delta=access_token_expires, fresh=False)

        return {
            "access_token": access_token,
        }, "200 "
