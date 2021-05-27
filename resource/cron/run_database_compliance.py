from flask_restful import Resource
from flask_jwt_extended import jwt_required
from db.db import DB
from decorator.verify_admin_access import verify_admin_access
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request


class RunDatabaseCompliance(Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
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
        anomalies += self._check_article_version_compliance(public_articles)

        anomalies = [{"category": "DATABASE COMPLIANCE", "value": v} for v in anomalies]

        self.db.insert(anomalies, self.db.tables["DataControl"])

        return "", "200 "

    # Company check functions

    def _check_company_compliance(self, companies):
        anomalies = []

        company_columns = self.db.tables["Company"].__table__.columns

        for col in company_columns:
            if col.name != "editus_status" and col.name != "rscl_number":
                empty_valued_companies = [c for c in companies if getattr(c, col.name) is None]

                if len(empty_valued_companies) > 0:
                    anomalies += [f"Value '{col.name}' of <COMPANY:{c.id}> is empty" for c in empty_valued_companies]

        return anomalies

    def _check_company_address_compliance(self, companies):
        anomalies = []

        company_addresses = self.db.get(self.db.tables["Company_Address"])

        # Get the companies without addresses

        company_address_ids = [a.company_id for a in company_addresses]
        companies_without_address = [c for c in companies if c.id not in company_address_ids]
        anomalies += [f"<COMPANY:{c.id}> has no address registered" for c in companies_without_address]

        # Get the companies with addresses without geolocation

        companies_without_loc = list({a.company_id for a in company_addresses
                                      if a.latitude is None or a.longitude is None})
        anomalies += [f"Company <COMPANY:{c.id}> has at least one address without geolocation"
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
            .filter(self.db.tables["TaxonomyValue"].category \
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

    def _check_article_version_compliance(self, articles):
        anomalies = []

        article_versions = self.db.get(self.db.tables["ArticleVersion"], {"is_main": True})

        # Get the articles without main version

        article_version_ids = [v.id for v in article_versions]
        article_without_main_version = [a for a in articles if a.id not in article_version_ids]
        anomalies += [f"<ARTICLE:{c.id}> has no main version" for c in article_without_main_version]

        # Get the articles with a main version without box

        article_version_boxes = self.db.get(
            self.db.tables["ArticleBox"],
            {"article_version_id": article_version_ids}
        )

        for a in articles:
            version = [v for v in article_versions if v.id == a.id]

            if len(version) == 1:
                boxes = [b for b in article_version_boxes if b.article_version_id == version[0].id]

                if len(boxes) == 0:
                    anomalies.append(f"<ARTICLE:{a.id}> has an empty main version")

        return anomalies
