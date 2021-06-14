from test.BaseCase import BaseCase
import datetime


class TestGetImages(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        self.db.insert({
            "id": 50,
            "thumbnail": bytes("", encoding='utf8'),
            "width": 10,
            "height": 10,
            "creation_date": datetime.datetime.today()
        }, self.db.tables["Image"])
        self.db.insert({
            "id": 51,
            "thumbnail": bytes("", encoding='utf8'),
            "width": 10,
            "height": 10,
            "creation_date": datetime.datetime.today()
        }, self.db.tables["Image"])

        response = self.application.get('/media/get_images',
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
                    'creation_date': datetime.date.today().strftime("%Y-%m-%d"),
                    'height': 10,
                    'id': 50,
                    'thumbnail': '',
                    'width': 10
                },
                {
                    'creation_date': datetime.date.today().strftime("%Y-%m-%d"),
                    'height': 10,
                    'id': 51,
                    'thumbnail': '',
                    'width': 10
                }
            ]
        }, response.json)

    @BaseCase.login
    def test_ok_with_logo(self, token):
        self.db.insert({
            "id": 50,
            "thumbnail": bytes("", encoding='utf8'),
            "width": 10,
            "height": 10,
            "creation_date": datetime.datetime.today()
        }, self.db.tables["Image"])
        self.db.insert({
            "id": 51,
            "thumbnail": bytes("", encoding='utf8'),
            "width": 10,
            "height": 10,
            "creation_date": datetime.datetime.today()
        }, self.db.tables["Image"])

        self.db.insert({"id": 2, "name": "My Company", "image": 50}, self.db.tables["Company"])

        response = self.application.get('/media/get_images?logo_only=true',
                                        headers=self.get_standard_header(token))

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
                    'creation_date': datetime.date.today().strftime("%Y-%m-%d"),
                    'height': 10,
                    'id': 50,
                    'thumbnail': '',
                    'width': 10
                }
            ]
        }, response.json)
