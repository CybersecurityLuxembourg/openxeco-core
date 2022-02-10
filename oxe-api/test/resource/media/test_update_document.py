from datetime import datetime

from test.BaseCase import BaseCase


class TestUpdateDocument(BaseCase):

    @BaseCase.login
    @BaseCase.grant_access("/media/update_document")
    def test_ok(self, token):
        self.db.insert({
            "id": 1,
            "filename": "empty_pdf.pdf",
            "size": 10,
            "creation_date": datetime.today(),
        }, self.db.tables["Document"])

        payload = {
            "id": 1,
            "keywords": "duck",
        }

        response = self.application.post('/media/update_document',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        images = self.db.get(self.db.tables["Document"], {"id": 1})

        self.assertEqual(200, response.status_code)
        self.assertEqual(len(images), 1)
        self.assertEqual(images[0].keywords, "duck")