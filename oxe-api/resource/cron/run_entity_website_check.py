import requests
from flask_apispec import MethodResource
from flask_apispec import doc
from flask_jwt_extended import jwt_required
from flask_restful import Resource

from db.db import DB
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access


class RunCompanyWebsiteCheck(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @doc(tags=['cron'],
         description='Run the health check of the entity websites. The result is written in the DataControl table '
                     'with "WEBSITE CHECK" as category.'
                     '<br/><br/>'
                     '<p>All the generated rows with "WEBSITE CHECK" as a category on DataControl table '
                     'are deleted when relaunched.</p>',
         responses={
             "200": {},
         })
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
                website = c.website if c.website.startswith("http") else "https://" + c.website
                try:
                    r = requests.head(website, allow_redirects=True)

                    if r.status_code != 200:
                        anomalies.append(f"The website of <COMPANY:{c.id}> returned code {r.status_code}")
                except Exception:
                    anomalies.append(f"The website of <COMPANY:{c.id}> seems unreachable")

        anomalies = [{"category": "WEBSITE CHECK", "value": v} for v in anomalies]

        self.db.insert(anomalies, self.db.tables["DataControl"])

        return "", "200 "
