from datetime import datetime

from test.BaseCase import BaseCase


class TestGetDocument(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        self.db.insert({
            "id": 50,
            "filename": "empty_pdf.pdf",
            "size": 10,
            "creation_date": datetime.today(),
        }, self.db.tables["Document"])

        response = self.application.get('/media/get_document/empty_pdf.pdf',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)

    @BaseCase.login
    def test_ok_with_id(self, token):
        self.db.insert({
            "id": 50,
            "filename": "empty_pdf.pdf",
            "size": 10,
            "creation_date": datetime.today(),
        }, self.db.tables["Document"])

        response = self.application.get('/media/get_document/50',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)

    @BaseCase.login
    def test_unexisting_id(self, token):
        response = self.application.get('/media/get_document/empty_pdf.pdf',
                                        headers=self.get_standard_header(token))

        self.assertEqual("422 Object not found", response.status)
