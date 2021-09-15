from datetime import datetime

from test.BaseCase import BaseCase


class TestGetImage(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        self.db.insert({
            "id": 2,
            "thumbnail": bytes("", encoding='utf8'),
            "width": 10,
            "height": 10,
            "creation_date": datetime.today(),
        }, self.db.tables["Image"])

        response = self.application.get('/media/get_image/2',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)

    @BaseCase.login
    def test_unexisting_id(self, token):
        response = self.application.get('/media/get_image/4',
                                        headers=self.get_standard_header(token))

        self.assertEqual("422 Object not found", response.status)
