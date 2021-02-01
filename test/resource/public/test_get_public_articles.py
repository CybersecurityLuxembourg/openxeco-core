from test.BaseCase import BaseCase
import datetime


class TestGetPublicArticles(BaseCase):

    def test_ok(self):
        self.db.insert({
            "id": 1,
            "title": "TITLE"
        }, self.db.tables["Article"])
        self.db.insert({
                "id": 2,
                "title": "TITLE2",
                "status": "PUBLIC",
                "publication_date": datetime.datetime.strptime('01-22-2021', '%m-%d-%Y').date()
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

        response = self.application.get('/public/get_public_articles')

        self.assertEqual(200, response.status_code)
        self.assertEqual([
            {
                'abstract': None,
                'handle': None,
                'id': 2,
                'image': None,
                'media': 'ALL',
                'publication_date': '2021-01-22',
                'status': 'PUBLIC',
                'title': 'TITLE2',
                'type': 'NEWS'
            },
        ], response.json)
