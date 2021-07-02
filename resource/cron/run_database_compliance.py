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

        companies = self.db.get(self.db.tables["Company"])

        anomalies += self._check_company_compliance(companies)
        anomalies += self._check_company_address_compliance(companies)
        anomalies += self._check_company_contact_compliance(companies)
        anomalies += self._check_company_taxonomy_compliance(companies)

        # Treat public articles

        public_articles = self.db.get(self.db.tables["Article"])

        anomalies += self._check_news_compliance(public_articles)
        anomalies += self._check_events_compliance(public_articles)
        anomalies += self._check_article_content_compliance(public_articles)

        anomalies = [{"category": "DATABASE COMPLIANCE", "value": v} for v in anomalies]

        self.db.insert(anomalies, self.db.tables["DataControl"])

        return "", "200 "

    # Company check functions

    def _check_company_compliance(self, companies):
        anomalies = []

        company_columns = self.db.tables["Company"].__table__.columns

        for col in company_columns:
            if col.name != "status" and col.name != "trade_register_number":
                empty_valued_companies = [c for c in companies if getattr(c, col.name) is None]

                if len(empty_valued_companies) > 0:
                    anomalies += [f"Value '{col.name}' of <COMPANY:{c.id}> is empty" for c in empty_valued_companies]

        return anomalies

    def _check_company_address_compliance(self, companies):
        anomalies = []

        company_addresses = self.db.get(self.db.tables["Company_Address"])

        # Get the companies without addresses

        company_address_ids = [a.company_id for a in company_addresses]
        companies_without_address = [c.id for c in companies if c.id not in company_address_ids]
        anomalies += [f"<COMPANY:{c}> has no address registered" for c in companies_without_address]

        # Get the companies with addresses without geolocation

        companies_without_loc = list({a.company_id for a in company_addresses
                                      if a.latitude is None or a.longitude is None})
        anomalies += [f"Company <COMPANY:{c}> has at least one address without geolocation"
                      for c in companies_without_loc]

        return anomalies

    def _check_company_contact_compliance(self, companies):
        anomalies = []

        company_contacts = self.db.get(self.db.tables["CompanyContact"])

        # Get the companies without phone number

        company_address_ids = [a.company_id for a in company_contacts if a.type == "PHONE NUMBER"]
        companies_without_address = [c for c in companies if c.id not in company_address_ids]
        anomalies += [f"<COMPANY:{c.id}> has no phone number registered as a contact"
                      for c in companies_without_address]

        # Get the companies without phone number

        company_address_ids = [a.company_id for a in company_contacts if a.type == "EMAIL ADDRESS"]
        companies_without_address = [c for c in companies if c.id not in company_address_ids]
        anomalies += [f"<COMPANY:{c.id}> has no email address registered  as a contact"
                      for c in companies_without_address]

        return anomalies

    def _check_company_taxonomy_compliance(self, companies):
        anomalies = []

        universal_categories = ["ENTITY TYPE"]
        actor_categories = ["SERVICE GROUP"]

        tv = self.db.session \
            .query(self.db.tables["TaxonomyValue"]) \
            .filter(self.db.tables["TaxonomyValue"].category
                    .in_(universal_categories + actor_categories + ["ECOSYSTEM ROLE"])) \
            .all()

        tv_per_category = {c: [tv.id for tv in tv if tv.category == c] for c in universal_categories + actor_categories}

        actor_tv = [v for v in tv if v.category == "ECOSYSTEM ROLE" and v.name == "ACTOR"]

        if len(actor_tv) == 0:
            return []

        actor_tv = actor_tv[0]

        taxonomy_assignments = self.db.session \
            .query(self.db.tables["TaxonomyAssignment"]).all()

        for company in companies:
            company_assignments = [a.taxonomy_value for a in taxonomy_assignments if a.company == company.id]
            categories_to_check = universal_categories \
                + (actor_categories if actor_tv.id in company_assignments else [])

            for category in categories_to_check:
                if len(list(set(company_assignments).intersection(tv_per_category[category]))) == 0:
                    anomalies.append(f"<COMPANY:{company.id}> has no value for taxonomy '{category}'")

        return anomalies

    # Article check functions

    def _check_news_compliance(self, articles):
        anomalies = []

        news = [a for a in articles if a.type == "NEWS"]
        article_columns = self.db.tables["Article"].__table__.columns

        for col in article_columns:
            if col.name in ["title", "handle", "publication_date"]:
                empty_valued_articles = [a for a in news if getattr(a, col.name) is None]

                if len(empty_valued_articles) > 0:
                    anomalies += [f"Value '{col}' of article <ARTICLE:{c.id}> is empty" for c in empty_valued_articles]

        return anomalies

    def _check_events_compliance(self, articles):
        anomalies = []

        news = [a for a in articles if a.type == "EVENT"]
        article_columns = self.db.tables["Article"].__table__.columns

        for col in article_columns:
            if col.name in ["title", "handle", "publication_date", "start_date", "end_date"]:
                empty_valued_articles = [a for a in news if getattr(a, col.name) is None]

                if len(empty_valued_articles) > 0:
                    anomalies += [f"Value '{col}' of article <ARTICLE:{c.id}> is empty" for c in empty_valued_articles]

        return anomalies

    def _check_article_content_compliance(self, articles):
        anomalies = []

        articles_without_link = [a for a in articles if a.link is None or len(a.link) == 0]
        article_versions = self.db.get(self.db.tables["ArticleVersion"], {"is_main": True})

        # Get the articles without main version

        article_version_ids = [v.id for v in article_versions]
        article_without_main_version = [a for a in articles_without_link if a.id not in article_version_ids]
        anomalies += [f"<ARTICLE:{c.id}> has no main version and no link" for c in article_without_main_version]

        # Get the articles with a main version without box

        article_version_boxes = self.db.get(
            self.db.tables["ArticleBox"],
            {"article_version_id": article_version_ids}
        )

        for a in articles_without_link:
            version = [v for v in article_versions if v.id == a.id]

            if len(version) == 1:
                boxes = [b for b in article_version_boxes if b.article_version_id == version[0].id]

                if len(boxes) == 0:
                    anomalies.append(f"<ARTICLE:{a.id}> has an empty main version and no link")

        return anomalies
