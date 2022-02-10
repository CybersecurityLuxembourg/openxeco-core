import base64
import os
from unittest.mock import patch
from datetime import datetime

from test.BaseCase import BaseCase


class TestAddDocument(BaseCase):

    @BaseCase.login
    @BaseCase.grant_access("/media/add_document")
    @patch('resource.media.add_document.DOCUMENT_FOLDER', os.path.join(os.path.dirname(os.path.realpath(__file__)),
                                                                 "test_add_document"))
    def test_ok(self, token):

        path = os.path.join(os.path.dirname(os.path.realpath(__file__)), "test_add_document", "empty_pdf.pdf")
        target_path = os.path.join(os.path.dirname(os.path.realpath(__file__)), "test_add_document", "1")

        if os.path.exists(target_path):
            os.remove(target_path)

        f = open(path, 'rb')
        data = base64.b64encode(f.read()).decode("utf-8")

        payload = {
            "filename": "empty_pdf.pdf",
            "data": data
        }

        f.close()

        response = self.application.post('/media/add_document',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        images = self.db.get(self.db.tables["Document"])

        self.assertEqual(200, response.status_code)
        self.assertEqual(len(images), 1)
        self.assertTrue(os.path.exists(target_path))
        os.remove(target_path)

    @BaseCase.login
    @BaseCase.grant_access("/media/add_document")
    @patch('resource.media.add_document.DOCUMENT_FOLDER', "/unexisting/path")
    def test_ko_file_exception(self, token):

        path = os.path.join(os.path.dirname(os.path.realpath(__file__)), "test_add_document", "empty_pdf.pdf")

        f = open(path, 'rb')
        data = base64.b64encode(f.read()).decode("utf-8")

        payload = {
            "filename": "empty_pdf.pdf",
            "data": data
        }

        response = self.application.post('/media/add_document',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        images = self.db.get(self.db.tables["Document"])

        self.assertEqual("500 An error occurred while saving the file", response.status)
        self.assertEqual(len(images), 0)

    @BaseCase.login
    @BaseCase.grant_access("/media/add_document")
    @patch('resource.media.add_document.DOCUMENT_FOLDER', os.path.join(os.path.dirname(os.path.realpath(__file__)),
                                                                       "test_add_document"))
    def test_ko_already_exists(self, token):
        self.db.insert({
            "id": 50,
            "filename": "empty_pdf.pdf",
            "size": 10,
            "creation_date": datetime.today(),
        }, self.db.tables["Document"])

        path = os.path.join(os.path.dirname(os.path.realpath(__file__)), "test_add_document", "empty_pdf.pdf")

        f = open(path, 'rb')
        data = base64.b64encode(f.read()).decode("utf-8")

        payload = {
            "filename": "empty_pdf.pdf",
            "data": data
        }

        response = self.application.post('/media/add_document',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual("422 A document is already existing with that filename", response.status)
        self.assertEqual(self.db.get_count(self.db.tables["Document"]), 1)
