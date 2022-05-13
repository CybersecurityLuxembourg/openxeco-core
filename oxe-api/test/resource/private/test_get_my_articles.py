import datetime

from test.BaseCase import BaseCase


class TestGetMyArticles(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        self.db.insert({"id": 14, "name": "My company"}, self.db.tables["Company"])
        self.db.insert({"user_id": 1, "company_id": 14}, self.db.tables["UserCompanyAssignment"])
        self.db.insert({
            "id": 1,
            "title": "TITLE",
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
            "status": "PUBLIC",
            "publication_date": datetime.datetime.strptime('01-22-2021', '%m-%d-%Y').date()
        }, self.db.tables["Article"])
        self.db.insert({"article": 2, "company": 14}, self.db.tables["ArticleCompanyTag"])
        self.db.insert({"article": 3, "company": 14}, self.db.tables["ArticleCompanyTag"])

        response = self.application.get('/private/get_my_articles?include_tags=true',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)
        self.assertEqual({
            "pagination": {
                "page": 1,
                "pages": 1,
                "per_page": 50,
                "total": 2,
            },
            "items": [
                {
                    'abstract': None,
                    'company_tags': [14],
                    'end_date': None,
                    'external_reference': None,
                    'handle': 'handle-3',
                    'id': 3,
                    'image': None,
                    'is_created_by_admin': 0,
                    'link': None,
                    'publication_date': '2021-01-22T00:00:00',
                    'start_date': None,
                    'status': 'PUBLIC',
                    'taxonomy_tags': [],
                    'title': 'TITLE3',
                    'type': 'NEWS'
                },
                {
                    'abstract': None,
                    'company_tags': [14],
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
                    'taxonomy_tags': [],
                    'title': 'TITLE2',
                    'type': 'NEWS'
                },
            ]
        }, response.json)
