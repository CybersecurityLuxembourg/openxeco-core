import datetime

from test.BaseCase import BaseCase


class TestGetRelatedArticles(BaseCase):

    def test_ok(self):

        # Insertion of articles
        self.db.insert({
            "id": 1,
            "title": "TITLE1",
            "handle": "TITLE1",
            "status": "PUBLIC",
            "publication_date": datetime.date.today() - datetime.timedelta(days=1)
        }, self.db.tables["Article"])
        self.db.insert({
            "id": 2,
            "title": "TITLE2",
            "status": "PUBLIC",
            "publication_date": datetime.date.today() - datetime.timedelta(days=2)
        }, self.db.tables["Article"])
        self.db.insert({
            "id": 3,
            "title": "TITLE3",
            "status": "PUBLIC",
            "publication_date": datetime.date.today() - datetime.timedelta(days=3)
        }, self.db.tables["Article"])
        self.db.insert({
            "id": 4,
            "title": "TITLE4",
            "status": "PUBLIC",
            "publication_date": datetime.date.today() - datetime.timedelta(days=4)
        }, self.db.tables["Article"])

        # Insertion of taxonomy

        self.db.insert({"name": "CAT1"}, self.db.tables["TaxonomyCategory"])
        self.db.insert({"id": 1, "name": "My Value", "category": "CAT1"}, self.db.tables["TaxonomyValue"])
        self.db.insert({"article": 1, "taxonomy_value": 1}, self.db.tables["ArticleTaxonomyTag"])
        self.db.insert({"article": 2, "taxonomy_value": 1}, self.db.tables["ArticleTaxonomyTag"])

        # Insertion of company

        self.db.insert({"id": 1, "name": "My Company"}, self.db.tables["Company"])
        self.db.insert({"article": 1, "company": 1}, self.db.tables["ArticleCompanyTag"])
        self.db.insert({"article": 3, "company": 1}, self.db.tables["ArticleCompanyTag"])

        # Request

        response = self.application.get('/public/get_related_articles/TITLE1')

        self.assertEqual(200, response.status_code)
        self.assertEqual([
            {
                'abstract': None,
                'end_date': None,
                'external_reference': None,
                'handle': None,
                'id': 2,
                'image': None,
                'is_created_by_admin': 0,
                'link': None,
                'publication_date': (datetime.date.today() - datetime.timedelta(days=2)).strftime("%Y-%m-%d"),
                'start_date': None,
                'status': 'PUBLIC',
                'title': 'TITLE2',
                'type': 'NEWS'
            },
            {
                'abstract': None,
                'end_date': None,
                'external_reference': None,
                'handle': None,
                'id': 3,
                'image': None,
                'is_created_by_admin': 0,
                'link': None,
                'publication_date': (datetime.date.today() - datetime.timedelta(days=3)).strftime("%Y-%m-%d"),
                'start_date': None,
                'status': 'PUBLIC',
                'title': 'TITLE3',
                'type': 'NEWS'
            }], response.json)

    def test_ok_empty_no_public(self):

        # Insertion of articles
        self.db.insert({
            "id": 1,
            "title": "TITLE1",
            "handle": "TITLE1",
            "status": "PUBLIC",
            "publication_date": datetime.date.today() - datetime.timedelta(days=1)
        }, self.db.tables["Article"])
        self.db.insert({
            "id": 2,
            "title": "TITLE2",
            "status": "DRAFT",
            "publication_date": datetime.date.today() - datetime.timedelta(days=1)
        }, self.db.tables["Article"])
        self.db.insert({
            "id": 3,
            "title": "TITLE3",
            "status": "DRAFT",
            "publication_date": datetime.date.today() - datetime.timedelta(days=1)
        }, self.db.tables["Article"])
        self.db.insert({
            "id": 4,
            "title": "TITLE4",
            "status": "PUBLIC",
            "publication_date": datetime.date.today() + datetime.timedelta(days=1)
        }, self.db.tables["Article"])

        # Insertion of taxonomy

        self.db.insert({"name": "CAT1"}, self.db.tables["TaxonomyCategory"])
        self.db.insert({"id": 1, "name": "My Value", "category": "CAT1"}, self.db.tables["TaxonomyValue"])
        self.db.insert({"article": 1, "taxonomy_value": 1}, self.db.tables["ArticleTaxonomyTag"])
        self.db.insert({"article": 2, "taxonomy_value": 1}, self.db.tables["ArticleTaxonomyTag"])

        # Insertion of company

        self.db.insert({"id": 1, "name": "My Company"}, self.db.tables["Company"])
        self.db.insert({"article": 1, "company": 1}, self.db.tables["ArticleCompanyTag"])
        self.db.insert({"article": 3, "company": 1}, self.db.tables["ArticleCompanyTag"])

        # Request

        response = self.application.get('/public/get_related_articles/TITLE1')

        self.assertEqual(200, response.status_code)
        self.assertEqual([], response.json)

    def test_ok_empty_no_assignment(self):

        # Insertion of articles
        self.db.insert({
            "id": 1,
            "title": "TITLE1",
            "handle": "TITLE1",
            "status": "PUBLIC",
            "publication_date": datetime.date.today() - datetime.timedelta(days=1)
        }, self.db.tables["Article"])
        self.db.insert({
            "id": 2,
            "title": "TITLE2",
            "status": "PUBLIC",
            "publication_date": datetime.date.today() - datetime.timedelta(days=1)
        }, self.db.tables["Article"])
        self.db.insert({
            "id": 3,
            "title": "TITLE3",
            "status": "DRAFT",
            "publication_date": datetime.date.today() - datetime.timedelta(days=1)
        }, self.db.tables["Article"])
        self.db.insert({
            "id": 4,
            "title": "TITLE4",
            "status": "PUBLIC",
            "publication_date": datetime.date.today() - datetime.timedelta(days=1)
        }, self.db.tables["Article"])

        # Request

        response = self.application.get('/public/get_related_articles/TITLE1')

        self.assertEqual(200, response.status_code)
        self.assertEqual([], response.json)

    def test_ko_no_article(self):
        response = self.application.get('/public/get_related_articles/TITLE1')

        self.assertEqual("422 The provided article ID does not exist or is not accessible", response.status)
