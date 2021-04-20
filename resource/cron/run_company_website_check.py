from flask_restful import Resource
from flask_jwt_extended import jwt_required
from db.db import DB
from decorator.verify_admin_access import verify_admin_access
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
import requests


class RunCompanyWebsiteCheck(Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @catch_exception
    @jwt_required
    @verify_admin_access
    def post(self):

        anomalies = []

        # Empty the current registered anomalies

        self.db.delete(self.db.tables["DataControl"], {"category": "WEBSITE CHECK"})

        companies = self.db.get(self.db.tables["Company"])

        for c in companies:
            if c.website is not None:
                r = requests.head(c.website)
                if r.status_code != 200:
                    anomalies.append(f"The website of <COMPANY:{c.id}> seems offline")

        anomalies = [{"category": "WEBSITE CHECK", "value": v} for v in anomalies]

        self.db.insert(anomalies, self.db.tables["DataControl"])

        return "", "200 "
