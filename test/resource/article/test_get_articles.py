from datetime import datetime

from test.BaseCase import BaseCase


class TestGetArticles(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        self.db.insert({"id": 1, "title": "TITLE"}, self.db.tables["Article"])
        self.db.insert({
                "id": 2,
                "title": "TITLE2",
                "publication_date": datetime.strptime('01-22-2021', '%m-%d-%Y').date()
            }, self.db.tables["Article"])

        response = self.application.get('/article/get_articles',
                                        headers=self.get_standard_header(token))

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
                'publication_date': '2021-01-22',
                'start_date': None,
                'status': 'DRAFT',
                'title': 'TITLE2',
                'type': 'NEWS'
            },
            {
                'abstract': None,
                'end_date': None,
                'external_reference': None,
                'handle': None,
                'id': 1,
                'image': None,
                'is_created_by_admin': 0,
                'link': None,
                'publication_date': None,
                'start_date': None,
                'status': 'DRAFT',
                'title': 'TITLE',
                'type': 'NEWS'
            }
        ], response.json)
