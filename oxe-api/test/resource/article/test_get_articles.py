import datetime

from test.BaseCase import BaseCase


class TestGetArticles(BaseCase):

    def insert_articles(self, today):
        self.db.insert({
            "id": 1,
            "title": "TITLE",
            "publication_date": today + datetime.timedelta(days=1),
            "start_date": today - datetime.timedelta(days=15),
            "end_date": today - datetime.timedelta(days=9)
        }, self.db.tables["Article"])
        self.db.insert({
            "id": 2,
            "title": "TITLE2",
            "publication_date": today,
            "start_date": today - datetime.timedelta(days=2),
            "end_date": today + datetime.timedelta(days=2)
        }, self.db.tables["Article"])
        self.db.insert({
            "id": 3,
            "title": "TITLE",
            "publication_date": today - datetime.timedelta(days=1),
            "start_date": today + datetime.timedelta(days=9),
            "end_date": today + datetime.timedelta(days=15)
        }, self.db.tables["Article"])

    @BaseCase.login
    def test_ok(self, token):
        self.db.insert({
            "id": 1,
            "title": "TITLE",
            "publication_date": datetime.date.today() + datetime.timedelta(days=1)
        }, self.db.tables["Article"])
        self.db.insert({
            "id": 2,
            "title": "TITLE2",
            "publication_date": datetime.date.today()
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
                'id': 1,
                'image': None,
                'is_created_by_admin': 0,
                'link': None,
                'publication_date': (datetime.date.today() + datetime.timedelta(days=1))
                    .strftime('%Y-%m-%d') + "T00:00:00",
                'start_date': None,
                'status': 'DRAFT',
                'sync_content': None,
                'sync_global': None,
                'sync_id': None,
                'sync_node': None,
                'sync_status': 'OK',
                'title': 'TITLE',
                'type': 'NEWS'
            },
            {
                'abstract': None,
                'end_date': None,
                'external_reference': None,
                'handle': None,
                'id': 2,
                'image': None,
                'is_created_by_admin': 0,
                'link': None,
                'publication_date': datetime.datetime.today().strftime('%Y-%m-%d') + "T00:00:00",
                'start_date': None,
                'status': 'DRAFT',
                'sync_content': None,
                'sync_global': None,
                'sync_id': None,
                'sync_node': None,
                'sync_status': 'OK',
                'title': 'TITLE2',
                'type': 'NEWS'
            },
        ], response.json)

    @BaseCase.login
    def test_ok_with_min_start_date(self, token):
        today = datetime.date.today()

        self.insert_articles(today)

        response = self.application.get(
            '/article/get_articles?min_start_date='
            + today.strftime('%Y-%m-%d') + "T00:00:00",
            headers=self.get_standard_header(token)
        )

        self.assertEqual(200, response.status_code)
        self.assertEqual([3], [i["id"] for i in response.json])

    @BaseCase.login
    def test_ok_with_max_start_date(self, token):
        today = datetime.date.today()

        self.insert_articles(today)

        response = self.application.get(
            '/article/get_articles?max_start_date='
            + today.strftime('%Y-%m-%d') + "T00:00:00",
            headers=self.get_standard_header(token)
        )

        self.assertEqual(200, response.status_code)
        self.assertEqual([1, 2], [i["id"] for i in response.json])

    @BaseCase.login
    def test_ok_with_min_end_date(self, token):
        today = datetime.date.today()

        self.insert_articles(today)

        response = self.application.get(
            '/article/get_articles?min_end_date='
            + today.strftime('%Y-%m-%d') + "T00:00:00",
            headers=self.get_standard_header(token)
        )

        self.assertEqual(200, response.status_code)
        self.assertEqual([2, 3], [i["id"] for i in response.json])

    @BaseCase.login
    def test_ok_with_max_end_date(self, token):
        today = datetime.date.today()

        self.insert_articles(today)

        response = self.application.get(
            '/article/get_articles?max_end_date='
            + today.strftime('%Y-%m-%d') + "T00:00:00",
            headers=self.get_standard_header(token)
        )

        self.assertEqual(200, response.status_code)
        self.assertEqual([1], [i["id"] for i in response.json])

    @BaseCase.login
    def test_ok_with_min_end_date(self, token):
        today = datetime.date.today()

        self.insert_articles(today)

        response = self.application.get(
            '/article/get_articles?min_end_date='
            + today.strftime('%Y-%m-%d') + "T00:00:00",
            headers=self.get_standard_header(token)
        )

        self.assertEqual(200, response.status_code)
        self.assertEqual([2, 3], [i["id"] for i in response.json])

    @BaseCase.login
    def test_ok_with_both_start_date(self, token):
        today = datetime.date.today()

        self.insert_articles(today)

        response = self.application.get(
            '/article/get_articles?min_start_date='
            + (today + datetime.timedelta(days=6)).strftime('%Y-%m-%d') + "T00:00:00"
            + "&max_start_date="
            + (today + datetime.timedelta(days=12)).strftime('%Y-%m-%d') + "T00:00:00",
            headers=self.get_standard_header(token)
        )

        self.assertEqual(200, response.status_code)
        self.assertEqual([3], [i["id"] for i in response.json])

    @BaseCase.login
    def test_ok_with_both_start_date_but_empty(self, token):
        today = datetime.date.today()

        self.insert_articles(today)

        response = self.application.get(
            '/article/get_articles?min_start_date='
            + (today + datetime.timedelta(days=11)).strftime('%Y-%m-%d') + "T00:00:00"
            + "&max_start_date="
            + (today + datetime.timedelta(days=12)).strftime('%Y-%m-%d') + "T00:00:00",
            headers=self.get_standard_header(token)
        )

        self.assertEqual(200, response.status_code)
        self.assertEqual([], [i["id"] for i in response.json])