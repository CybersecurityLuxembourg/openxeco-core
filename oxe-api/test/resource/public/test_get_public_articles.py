import datetime

from test.BaseCase import BaseCase


class TestGetPublicArticles(BaseCase):

    def test_ok(self):
        self.db.insert({
            "id": 1,
            "title": "TITLE"
        }, self.db.tables["Article"])
        self.db.insert({
            "id": 2,
            "title": "TITLE2",
            "handle": "handle-2",
            "status": "PUBLIC",
            "publication_date": datetime.datetime.strptime('01-22-2021', '%m-%d-%Y').date()
        }, self.db.tables["Article"])
        self.db.insert({
            "id": 3,
            "title": "TITLE3",
            "handle": "handle-3",
            "status": "DRAFT",
            "publication_date": datetime.date.today() - datetime.timedelta(days=1)
        }, self.db.tables["Article"])
        self.db.insert({
            "id": 4,
            "title": "TITLE4",
            "handle": "handle-4",
            "status": "PUBLIC",
            "publication_date": datetime.date.today() + datetime.timedelta(days=1)
        }, self.db.tables["Article"])

        response = self.application.get('/public/get_public_articles')

        self.assertEqual(200, response.status_code)
        self.assertEqual({
            "pagination": {
                "page": 1,
                "pages": 1,
                "per_page": 50,
                "total": 1,
            },
            "items": [
                {
                    'abstract': None,
                    'end_date': None,
                    'external_reference': None,
                    'handle': 'handle-2',
                    'id': 2,
                    'image': None,
                    'is_created_by_admin': 0,
                    'link': None,
                    'publication_date': '2021-01-22T00:00:00',
                    'start_date': None,
                    'status': 'PUBLIC',
                    'title': 'TITLE2',
                    'type': 'NEWS'
                },
            ]
        }, response.json)

    def test_ok_with_several_pages(self):
        self.db.insert({
            "id": 2,
            "title": "TITLE2",
            "handle": "handle-2",
            "status": "PUBLIC",
            "publication_date": "2021-01-24"
        }, self.db.tables["Article"])
        self.db.insert({
            "id": 4,
            "title": "TITLE4",
            "handle": "handle-4",
            "status": "PUBLIC",
            "publication_date": "2021-01-22"
        }, self.db.tables["Article"])

        page1_response = self.application.get('/public/get_public_articles?per_page=1')
        page2_response = self.application.get('/public/get_public_articles?per_page=1&page=2')

        self.assertEqual(200, page1_response.status_code)
        self.assertEqual({
            "pagination": {
                "page": 1,
                "pages": 2,
                "per_page": 1,
                "total": 2,
            },
            "items": [
                {
                    'abstract': None,
                    'end_date': None,
                    'external_reference': None,
                    'handle': 'handle-2',
                    'id': 2,
                    'image': None,
                    'is_created_by_admin': 0,
                    'link': None,
                    'publication_date': '2021-01-24T00:00:00',
                    'start_date': None,
                    'status': 'PUBLIC',
                    'title': 'TITLE2',
                    'type': 'NEWS'
                },
            ]
        }, page1_response.json)

        self.assertEqual(200, page2_response.status_code)
        self.assertEqual({
            "pagination": {
                "page": 2,
                "pages": 2,
                "per_page": 1,
                "total": 2,
            },
            "items": [
                {
                    'abstract': None,
                    'end_date': None,
                    'external_reference': None,
                    'handle': 'handle-4',
                    'id': 4,
                    'image': None,
                    'is_created_by_admin': 0,
                    'link': None,
                    'publication_date': '2021-01-22T00:00:00',
                    'start_date': None,
                    'status': 'PUBLIC',
                    'title': 'TITLE4',
                    'type': 'NEWS'
                }
            ]
        }, page2_response.json)

    def test_ok_with_tags(self):
        self.db.insert({
            "id": 2,
            "title": "TITLE2",
            "handle": "handle-2",
            "status": "PUBLIC",
            "publication_date": "2021-01-24"
        }, self.db.tables["Article"])

        self.db.insert({"id": 1, "name": "COMPANY"}, self.db.tables["Company"])
        self.db.insert({"article": 2, "company": 1}, self.db.tables["ArticleCompanyTag"])

        self.db.insert({"name": "CAT"}, self.db.tables["TaxonomyCategory"])
        self.db.insert({"id": 3, "name": "VALUE", "category": "CAT"}, self.db.tables["TaxonomyValue"])
        self.db.insert({"article": 2, "taxonomy_value": 3}, self.db.tables["ArticleTaxonomyTag"])

        response = self.application.get('/public/get_public_articles?include_tags=true')

        self.assertEqual(200, response.status_code)
        self.assertEqual({
            "pagination": {
                "page": 1,
                "pages": 1,
                "per_page": 50,
                "total": 1,
            },
            "items": [
                {
                    'abstract': None,
                    'end_date': None,
                    'external_reference': None,
                    'handle': 'handle-2',
                    'id': 2,
                    'image': None,
                    'is_created_by_admin': 0,
                    'link': None,
                    'publication_date': '2021-01-24T00:00:00',
                    'start_date': None,
                    'status': 'PUBLIC',
                    'title': 'TITLE2',
                    'type': 'NEWS',
                    'company_tags': [1],
                    'taxonomy_tags': [3],
                },
            ]
        }, response.json)

    def test_ok_with_company_filter(self):
        self.db.insert({
            "id": 1,
            "title": "TITLE",
            "handle": "handle-1",
            "status": "PUBLIC",
            "publication_date": datetime.datetime.strptime('01-22-2021', '%m-%d-%Y').date()
        }, self.db.tables["Article"])
        self.db.insert({
            "id": 2,
            "title": "TITLE2",
            "handle": "handle-2",
            "status": "PUBLIC",
            "publication_date": datetime.datetime.strptime('01-22-2021', '%m-%d-%Y').date()
        }, self.db.tables["Article"])
        self.db.insert({
            "id": 3,
            "title": "TITLE3",
            "handle": "handle-3",
            "status": "DRAFT",
            "publication_date": datetime.date.today() - datetime.timedelta(days=1)
        }, self.db.tables["Article"])

        self.db.insert({"id": 2, "name": "My Company"}, self.db.tables["Company"])

        self.db.insert({"article": 2, "company": 2}, self.db.tables["ArticleCompanyTag"])

        response = self.application.get('/public/get_public_articles?companies=2')

        self.assertEqual(200, response.status_code)
        self.assertEqual({
            "pagination": {
                "page": 1,
                "pages": 1,
                "per_page": 50,
                "total": 1,
            },
            "items": [
                {
                    'abstract': None,
                    'end_date': None,
                    'external_reference': None,
                    'handle': 'handle-2',
                    'id': 2,
                    'image': None,
                    'is_created_by_admin': 0,
                    'link': None,
                    'publication_date': '2021-01-22T00:00:00',
                    'start_date': None,
                    'status': 'PUBLIC',
                    'title': 'TITLE2',
                    'type': 'NEWS'
                },
            ]
        }, response.json)
