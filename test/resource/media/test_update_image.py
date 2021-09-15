from datetime import datetime

from test.BaseCase import BaseCase


class TestUpdateImage(BaseCase):

    @BaseCase.login
    @BaseCase.grant_access("/media/update_image")
    def test_ok(self, token):
        self.db.insert({
            "id": 2,
            "thumbnail": bytes("", encoding='utf8'),
            "width": 10,
            "height": 10,
            "creation_date": datetime.today(),
        }, self.db.tables["Image"])

        payload = {
            "id": 2,
            "keywords": "duck",
        }

        response = self.application.post('/media/update_image',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        images = self.db.get(self.db.tables["Image"], {"id": 2})

        self.assertEqual(200, response.status_code)
        self.assertEqual(len(images), 1)
        self.assertEqual(images[0].keywords, "duck")