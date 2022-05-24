import datetime

from test.BaseCase import BaseCase


class TestGetArticle(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        self.db.insert({
            "id": 1,
            "title": "TITLE",
            "publication_date": datetime.date.today()
        }, self.db.tables["Article"])

        response = self.application.get('/article/get_article/1',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)
        self.assertEqual({
            'abstract': None,
            'end_date': None,
            'external_reference': None,
            'handle': None,
            'id': 1,
            'image': None,
            'is_created_by_admin': 0,
            'link': None,
            'publication_date': datetime.datetime.today().date().strftime('%Y-%m-%d') + "T00:00:00",
            'start_date': None,
            'status': 'DRAFT',
            'sync_address': None,
            'sync_global': None,
            'sync_id': None,
            'sync_node': None,
            'sync_status': 'OK',
            'title': 'TITLE',
            'type': 'NEWS'
        }, response.json)

    @BaseCase.login
    def test_ok_empty(self, token):
        response = self.application.get('/article/get_article/2',
                                        headers=self.get_standard_header(token))

        self.assertEqual("422 Object not found", response.status)
