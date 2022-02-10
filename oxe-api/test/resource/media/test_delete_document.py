from test.BaseCase import BaseCase
from datetime import datetime
import os
import shutil
from unittest.mock import patch


class TestDeleteDocument(BaseCase):

    @BaseCase.login
    @BaseCase.grant_access("/media/delete_document")
    @patch('resource.media.delete_document.DOCUMENT_FOLDER',
           os.path.join(os.path.dirname(os.path.realpath(__file__)),
                        "test_delete_document_temp"))
    def test_ok(self, token):
        shutil.copy(
            os.path.join(os.path.dirname(os.path.realpath(__file__)), "test_delete_document", "empty_pdf.pdf"),
            os.path.join(os.path.dirname(os.path.realpath(__file__)), "test_delete_document_temp", "50")
        )
        self.assertTrue(os.path.exists(os.path.join(os.path.dirname(os.path.realpath(__file__)),
                                                     "test_delete_document_temp", "50")))
        self.db.insert({
            "id": 50,
            "filename": "empty_pdf.pdf",
            "size": 10,
            "creation_date": datetime.today(),
        }, self.db.tables["Document"])

        payload = {
            "id": 50
        }

        response = self.application.post('/media/delete_document',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual(200, response.status_code)
        self.assertEqual(self.db.get_count(self.db.tables["Document"]), 0)
        self.assertFalse(os.path.exists(os.path.join(os.path.dirname(os.path.realpath(__file__)),
                                                     "test_delete_document_temp", "50")))

    @BaseCase.login
    @BaseCase.grant_access("/media/delete_document")
    @patch('resource.media.delete_document.DOCUMENT_FOLDER',
           os.path.join(os.path.dirname(os.path.realpath(__file__)),
                        "test_delete_document_temp"))
    def test_delete_unexisting_file(self, token):
        self.db.insert({
            "id": 50,
            "filename": "empty_pdf.pdf",
            "size": 10,
            "creation_date": datetime.today(),
        }, self.db.tables["Document"])

        payload = {
            "id": 50
        }

        response = self.application.post('/media/delete_document',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual(200, response.status_code)
        self.assertEqual(self.db.get_count(self.db.tables["Document"]), 0)

    @BaseCase.login
    @BaseCase.grant_access("/media/delete_document")
    @patch('resource.media.delete_document.DOCUMENT_FOLDER',
           os.path.join(os.path.dirname(os.path.realpath(__file__)),
                        "test_delete_document_temp"))
    def test_delete_unexisting_record(self, token):
        payload = {
            "id": 50
        }

        response = self.application.post('/media/delete_document',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual(200, response.status_code)