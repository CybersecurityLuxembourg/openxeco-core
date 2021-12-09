from flask_apispec import MethodResource
from flask_apispec import doc
from flask_jwt_extended import jwt_required
from flask_restful import Resource

from db.db import DB
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access


class RunDatabaseCompliance(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @doc(tags=['cron'],
         description='Run the compliance check of the database content. The result is written in the DataControl table'
                     'with "DATABASE COMPLIANCE" as category.'
                     '<br/>'
                     "<br/>Checks for the entities:"
                     "<ul>"
                     "<li>Check if image, website, creation date are not empty</li>"
                     "<li>Check if there is at least one physical address</li>"
                     "<li>Check if there is at least one phone number contact</li>"
                     "<li>Check if there is at least one email address contact</li>"
                     "<li>Check if there is an ENTITY TYPE from the taxonomy</li>"
                     "<li>Check if there is at least one SERVICE GROUP from the ACTORs</li>"
                     "</ul>"
                     "<p>Checks for the news articles:</p>"
                     "<ul>"
                     "<li>Check if title, handle and publication date are not empty</li>"
                     "<li>Check if it has a link or a main version with at least one content box</li>"
                     "</ul>"
                     "<p>Checks for the event articles:</p>"
                     "<ul>"
                     "<li>Check if title, handle, publication date, start date and end date are not empty</li>"
                     "<li>Check if it has a link or a main version with at least one content box</li>"
                     "</ul>"
                     '<p>All the generated rows with "DATABASE COMPLIANCE" as category on DataControl '
                     'table are deleted when relaunched.</p>',
         responses={
             "200": {},
         })
    @catch_exception
    @jwt_required
    @verify_admin_access
    def post(self):

        anomalies = []

        # Empty the current registered anomalies

        self.db.delete(self.db.tables["DataControl"], {"category": "DATABASE COMPLIANCE"})

        # Treat companies

        settings = self.db.get(self.db.tables["Setting"])
        companies = self.db.get(self.db.tables["Company"])

        anomalies += self._check_company_compliance(companies, settings)
        anomalies += self._check_company_address_compliance(companies, settings)
        anomalies += self._check_company_contact_compliance(companies, settings)

        # Treat public articles

        public_articles = self.db.get(self.db.tables["Article"])

        anomalies += self._check_article_compliance(public_articles, settings)
        anomalies += self._check_article_content_compliance(public_articles, settings)

        anomalies = [{"category": "DATABASE COMPLIANCE", "value": v} for v in anomalies]

        self.db.insert(anomalies, self.db.tables["DataControl"])

        return "", "200 "

    # Company check functions

    def _check_company_compliance(self, companies, settings):
        anomalies = []

        company_columns = []

        if RunDatabaseCompliance._is_setting_true(settings, "HIGHLIGHT_ENTITIES_WITHOUT_CREATION_DATE"):
            company_columns.append("creation_date")
        if RunDatabaseCompliance._is_setting_true(settings, "HIGHLIGHT_ENTITIES_WITHOUT_WEBSITE"):
            company_columns.append("website")
        if RunDatabaseCompliance._is_setting_true(settings, "HIGHLIGHT_ENTITIES_WITHOUT_IMAGE"):
            company_columns.append("image")

        for col in company_columns:
            empty_valued_companies = [c for c in companies if getattr(c, col) is None]

            if len(empty_valued_companies) > 0:
                anomalies += [f"Value '{col}' of <COMPANY:{c.id}> is empty" for c in empty_valued_companies]

        return anomalies

    def _check_company_address_compliance(self, companies, settings):
        anomalies = []

        company_addresses = self.db.get(self.db.tables["Company_Address"])

        # Get the companies without addresses

        if RunDatabaseCompliance._is_setting_true(settings, "HIGHLIGHT_ENTITIES_WITHOUT_POSTAL_ADDRESS"):
            company_address_ids = [a.company_id for a in company_addresses]
            companies_without_address = [c.id for c in companies if c.id not in company_address_ids]
            anomalies += [f"<COMPANY:{c}> has no address registered" for c in companies_without_address]

        # Get the companies with addresses without geolocation

        if RunDatabaseCompliance._is_setting_true(settings, "HIGHLIGHT_ENTITIES_WITH_POSTAL_ADDRESS_MISSING_GEOLOCATION"):
            companies_without_loc = list({a.company_id for a in company_addresses
                                          if a.latitude is None or a.longitude is None})
            anomalies += [f"Company <COMPANY:{c}> has at least one address without geolocation"
                          for c in companies_without_loc]

        return anomalies

    def _check_company_contact_compliance(self, companies, settings):
        anomalies = []

        company_contacts = self.db.get(self.db.tables["CompanyContact"])

        # Get the companies without phone number

        if RunDatabaseCompliance._is_setting_true(settings, "HIGHLIGHT_ENTITIES_WITHOUT_PHONE_NUMBER"):
            company_address_ids = [a.company_id for a in company_contacts if a.type == "PHONE NUMBER"]
            companies_without_address = [c for c in companies if c.id not in company_address_ids]
            anomalies += [f"<COMPANY:{c.id}> has no phone number registered as a contact"
                          for c in companies_without_address]

        # Get the companies without email address

        if RunDatabaseCompliance._is_setting_true(settings, "HIGHLIGHT_ENTITIES_WITHOUT_EMAIL_ADDRESS"):
            company_address_ids = [a.company_id for a in company_contacts if a.type == "EMAIL ADDRESS"]
            companies_without_address = [c for c in companies if c.id not in company_address_ids]
            anomalies += [f"<COMPANY:{c.id}> has no email address registered  as a contact"
                          for c in companies_without_address]

        return anomalies

    # Article check functions

    def _check_article_compliance(self, articles, settings):
        anomalies = []

        article_columns = []

        if RunDatabaseCompliance._is_setting_true(settings, "HIGHLIGHT_ARTICLE_WITHOUT_TITLE"):
            article_columns.append("title")
        if RunDatabaseCompliance._is_setting_true(settings, "HIGHLIGHT_ARTICLE_WITHOUT_HANDLE"):
            article_columns.append("handle")
        if RunDatabaseCompliance._is_setting_true(settings, "HIGHLIGHT_ARTICLE_WITHOUT_PUBLICATION_DATE"):
            article_columns.append("publication_date")
        if RunDatabaseCompliance._is_setting_true(settings, "HIGHLIGHT_ARTICLE_WITHOUT_START_DATE"):
            article_columns.append("start_date")
        if RunDatabaseCompliance._is_setting_true(settings, "HIGHLIGHT_ARTICLE_WITHOUT_END_DATE"):
            article_columns.append("end_date")

        for col in article_columns:
            empty_valued_articles = [a for a in articles if getattr(a, col) is None]
            empty_valued_articles = [a for a in empty_valued_articles
                                     if a.type == "EVENT" or col not in ["start_date", "end_date"]]

            if len(empty_valued_articles) > 0:
                anomalies += [f"Value '{col}' of article <ARTICLE:{c.id}> is empty" for c in empty_valued_articles]

        return anomalies

    def _check_article_content_compliance(self, articles, settings):
        anomalies = []

        if RunDatabaseCompliance._is_setting_true(settings, "HIGHLIGHT_ARTICLE_WITHOUT_CONTENT"):
            articles_without_link = [a for a in articles if a.link is None or len(a.link) == 0]
            article_versions = self.db.get(self.db.tables["ArticleVersion"], {"is_main": True})

            # Get the articles without main version

            article_ids_from_mv = [v.article_id for v in article_versions]
            article_without_main_version = [a for a in articles_without_link if a.id not in article_ids_from_mv]
            anomalies += [f"<ARTICLE:{c.id}> has no main version and no link" for c in article_without_main_version]

            # Get the articles with a main version without box

            article_version_ids = [v.id for v in article_versions]
            article_version_boxes = self.db.get(
                self.db.tables["ArticleBox"],
                {"article_version_id": article_version_ids}
            )

            for a in articles_without_link:
                version = [v for v in article_versions if v.article_id == a.id]

                if len(version) == 1:
                    boxes = [b for b in article_version_boxes if b.article_version_id == version[0].id]

                    if len(boxes) == 0:
                        anomalies.append(f"<ARTICLE:{a.id}> has an empty main version and no link")

            return anomalies
        return []

    @staticmethod
    def _is_setting_true(settings, setting_value):
        s = [s for s in settings if s.property == setting_value and s.value == "TRUE"]
        return len(s) > 0
