import copy
import json
import re
from datetime import datetime
from urllib3 import ProxyManager
from urllib import request

from flask_apispec import MethodResource
from flask_apispec import doc
from flask_jwt_extended import jwt_required
from flask_restful import Resource
from sqlalchemy import func

from db.db import DB
from config.config import HTTP_PROXY
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access


class UpdateMoovijobJobOffers(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @doc(tags=['cron'],
         description='Update the job offers from Moovijob',
         responses={
             "200": {},
             "500.a": {"description": "No article has been treated"},
             "500.b": {"description": "Moovijob company not found"},
             "500.c": {"description": "Too many Moovijob company found"},
         })
    @jwt_required
    @verify_admin_access
    @catch_exception  # pylint: disable=too-many-locals
    def post(self):

        base_url = "https://www.moovijob.com/api/job-offers/search?job_categories[]=informatique-consulting" \
                   "&job_categories[]=informatique-dev&job_categories[]=informatique-infra-reseau&q=security"

        if HTTP_PROXY is not None:
            http = ProxyManager(HTTP_PROXY)
            response = http.request('GET', base_url)
            content = response.data
        else:
            response = request.urlopen(base_url)  # nosec
            content = response.read()

        data = json.loads(content)

        external_references = []

        nb_pages = data["last_page"] if "last_page" in data and isinstance(data["last_page"], int) else None
        current_page = 1
        count = {
            "reviewed": 0,
            "created": 0,
            "modified": 0,
            "deactivated": 0
        }

        if nb_pages is None:
            return [], "500 No article has been treated"

        # Get the Moovijob company

        company = self.db.session.query(self.db.tables["Company"]) \
            .filter(func.lower(self.db.tables["Company"].name).like("%moovijob%")) \
            .all()

        if len(company) == 0:
            return [], "500 Moovijob company not found"
        if len(company) > 1:
            return [], "500 Too many Moovijob company found"

        company = company[0]

        # process page

        while current_page <= nb_pages:
            external_references += [str(a["id"]) for a in data["data"]]

            db_articles = self.db.get(
                self.db.tables["Article"],
                {"external_reference": [str(a["id"]) for a in data["data"]]}
            )

            for source_article in data["data"]:
                db_article = [a for a in db_articles if str(source_article["id"]) == a.external_reference]
                db_article = db_article[0] if len(db_article) > 0 else self.db.tables["Article"]()

                count["reviewed"] += 1
                count["created"] += 1 if db_article.id is None else 0

                db_article, m1 = self._manage_article(db_article, source_article, company)
                db_article_version, m2 = self._manage_article_version(db_article)
                _, m3 = self._manage_article_version_box(db_article_version, source_article)

                count["modified"] += 1 if (db_article.id is not None and (m1 or m2 or m3)) else 0

            # Prepare for next page

            current_page += 1

            if current_page <= nb_pages:
                if HTTP_PROXY is not None:
                    http = ProxyManager(HTTP_PROXY)
                    response = http.request('GET', f"{base_url}&page={current_page}")
                    content = response.data
                else:
                    response = request.urlopen(f"{base_url}&page={current_page}")  # nosec
                    content = response.read()

                data = json.loads(content)

        # Deactivate the missing offers

        self._deactivate_deprecated_offers(company, external_references)

        # Send response

        return "", f"200 Success: {count['reviewed']} treated, {count['created']} created, " \
                   f"{count['modified']} modified, {count['deactivated']} deactivated"

    def _manage_article(self, a, source, company):
        copied_a = copy.deepcopy(a)

        today = datetime.today().strftime("%Y-%m-%d")
        title = self._get_preferred_lang_info(source['title'])
        handle = f"{source['id']}-{re.sub(r'[^a-z1-9-]', '', title.lower().replace(' ', '-'))[:80]}"

        # Insert data into Article object

        a.external_reference = source["id"] if a.external_reference is None else a.external_reference
        a.title = title if a.title is None else a.title
        a.handle = handle if a.handle is None else a.handle
        a.type = "JOB OFFER" if a.type is None else a.type
        a.publication_date = today if a.publication_date is None else a.publication_date
        a.status = "PUBLIC" if a.status is None else a.status
        a.link = self._get_preferred_lang_info(source["urls"]) if a.link is None else a.link

        # Save modifications in DB

        article = self.db.merge(a, self.db.tables["Article"])
        is_modified = not self.db.are_objects_equal(a, copied_a, self.db.tables["Article"])

        # Add the Moovijob relationship if it does not exist

        tags = self.db.get(self.db.tables["ArticleCompanyTag"], {"company": company.id, "article": article.id})

        if len(tags) == 0:
            self.db.insert({"company": company.id, "article": article.id}, self.db.tables["ArticleCompanyTag"])

        return article, is_modified

    def _manage_article_version(self, a):
        versions = self.db.get(self.db.tables["ArticleVersion"], {"article_id": a.id, "is_main": True})

        if len(versions) == 0:
            article_version = self.db.tables["ArticleVersion"]()
            article_version.article_id = a.id
            article_version.name = "Generated by cron/update_moovijob_job_offers"
            article_version.is_main = True
            return self.db.merge(article_version, self.db.tables["ArticleVersion"]), True

        return versions[0], False

    def _manage_article_version_box(self, v, source):

        boxes = self.db.get(self.db.tables["ArticleBox"], {"article_version_id": v.id})

        if len(boxes) == 0:
            article_box = self.db.tables["ArticleBox"]()
            article_box.article_version_id = v.id
            article_box.position = 1
            article_box.type = "PARAGRAPH"
            article_box.content = self._get_preferred_lang_info(source["body"])
            return self.db.merge(article_box, self.db.tables["ArticleBox"]), True
        if len(boxes) == 1 and boxes[0].type == "PARAGRAPH":
            if boxes[0].content != self._get_preferred_lang_info(source["body"]):
                boxes[0].content = self._get_preferred_lang_info(source["body"])
                return self.db.merge(boxes[0], self.db.tables["ArticleBox"]), True

            return boxes[0].content, False

        return None, False

    def _deactivate_deprecated_offers(self, company, external_references):
        subquery = self.db.session.query(self.db.tables["ArticleCompanyTag"]) \
            .with_entities(self.db.tables["ArticleCompanyTag"].article) \
            .filter(self.db.tables["ArticleCompanyTag"].company == company.id) \
            .subquery()

        offers_to_archive = self.db.session.query(self.db.tables["Article"]) \
            .filter(self.db.tables["Article"].status == "PUBLIC") \
            .filter(self.db.tables["Article"].id.in_(subquery)) \
            .filter(self.db.tables["Article"].external_reference.notin_(external_references)) \
            .all()

        if len(offers_to_archive) > 0:
            for o in offers_to_archive:
                o.status = "ARCHIVE"

            self.db.merge(offers_to_archive, self.db.tables["Article"])

    @staticmethod
    def _get_preferred_lang_info(lang_dict):
        if "en" in lang_dict and lang_dict["en"] is not None:
            return lang_dict["en"]
        if "fr" in lang_dict and lang_dict["fr"] is not None:
            return lang_dict["fr"]
        if "de" in lang_dict and lang_dict["de"] is not None:
            return lang_dict["de"]
        if len(lang_dict.keys()) > 0:
            return lang_dict[list(lang_dict.keys())[0]]
        return None
