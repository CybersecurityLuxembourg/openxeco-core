from flask_restful import Resource
from flask import request
from flask_jwt_extended import jwt_required
from decorator.verify_admin_access import verify_admin_access
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from config.config import JOBADDER_CLIENT_ID, JOBADDER_CLIENT_SECRET, JOBADDER_REFRESH_TOKEN, JOBADDER_ACCESS_TOKEN
import json


class GetJobAdderStatus(Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @catch_exception
    @jwt_required
    @verify_admin_access
    def get(self):

        is_connected = True
        response = None
        connection_error = None

        try:
            response = request.urlopen("https://id.jobadder.com/v2/jobs")
            response_data = json.loads(response.read())
        except Exception as e:
            is_connected = False
            response_data = {}
            connection_error = repr(e)

        data = {
            "client_id": JOBADDER_CLIENT_ID,
            "redirect_uri": f"{request.url_root}jobadder/connect_jobadder",

            "has_client_secret": JOBADDER_CLIENT_SECRET is not None,
            "has_refresh_token": JOBADDER_REFRESH_TOKEN is not None,
            "has_access_token": JOBADDER_ACCESS_TOKEN is not None,

            "is_connected": is_connected and response is not None and response.status == 200
                            and "items" in response_data,
            "connection_error": connection_error,
        }

        return data, "200 "
