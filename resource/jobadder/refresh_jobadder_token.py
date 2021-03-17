from flask_restful import Resource
from flask import request
from flask_jwt_extended import jwt_required
from decorator.verify_admin_access import verify_admin_access
from decorator.verify_payload import verify_payload
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from config.config import JOBADDER_CLIENT_ID, JOBADDER_CLIENT_SECRET, JOBADDER_REFRESH_TOKEN
import json
import os


class RefreshJobAdderToken(Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @catch_exception
    @verify_payload([])
    @jwt_required
    @verify_admin_access
    def post(self):
        input_data = request.get_json()

        if "code" in input_data:
            os.environ["JOBADDER_REFRESH_TOKEN"] = input_data["code"]

        if JOBADDER_REFRESH_TOKEN is None:
            return "", "422 No refresh token found"

        params = {
            "client_id": JOBADDER_CLIENT_ID,
            "client_secret": JOBADDER_CLIENT_SECRET,
            "grant_type": JOBADDER_REFRESH_TOKEN,
            "code": JOBADDER_REFRESH_TOKEN,
            "redirect_uri": f"{request.url_root}jobadder/refresh_jobadder_token"
        }

        response = request.post("https://id.jobadder.com/v2/jobs", params)
        response_data = json.loads(response.read())

        os.environ["JOBADDER_ACCESS_TOKEN"] = response_data["access_token"] if "access_token" in response_data else None
        os.environ["JOBADDER_REFRESH_TOKEN"] = response_data["refresh_token"] \
            if "refresh_token" in response_data else None

        return "The access token has been refreshed", "200 The access token has been refreshed"
