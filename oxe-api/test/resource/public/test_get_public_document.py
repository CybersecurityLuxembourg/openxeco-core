import os
from unittest.mock import patch
from datetime import datetime
from test.BaseCase import BaseCase


class TestGetPublicDocument(BaseCase):

    @patch('resource.public.get_public_document.DOCUMENT_FOLDER', os.path.join(os.path.dirname(os.path.realpath(__file__)),
                                                                         "test_get_public_document"))
    def test_ok(self):
        self.db.insert({
            "id": 1,
            "filename": "empty_pdf.pdf",
            "size": 10,
            "creation_date": datetime.today(),
        }, self.db.tables["Document"])

        response = self.application.get('/public/get_public_document/empty_pdf.pdf')

        self.assertEqual(200, response.status_code)

    @patch('resource.public.get_public_document.DOCUMENT_FOLDER', os.path.join(os.path.dirname(os.path.realpath(__file__)),
                                                                         "test_get_public_document"))
    def test_ko_missing_record(self):
        response = self.application.get('/public/get_public_document/empty_pdf.pdf')

        self.assertEqual("422 No document found with this filename", response.status)

    @patch('resource.public.get_public_document.DOCUMENT_FOLDER', os.path.join(os.path.dirname(os.path.realpath(__file__)),
                                                                         "test_get_public_document"))
    def test_ko_missing_file(self):
        self.db.insert({
            "id": 2,
            "filename": "empty_pdf.pdf",
            "size": 10,
            "creation_date": datetime.today(),
        }, self.db.tables["Document"])

        response = self.application.get('/public/get_public_document/empty_pdf.pdf')

        self.assertEqual("422 Document not found", response.status)
