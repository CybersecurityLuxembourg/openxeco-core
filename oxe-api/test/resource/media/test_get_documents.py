from datetime import datetime, date, timedelta

from test.BaseCase import BaseCase


class TestGetDocuments(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        self.db.insert({
            "id": 50,
            "filename": "empty_pdf.pdf",
            "size": 10,
            "creation_date": datetime.today(),
        }, self.db.tables["Document"])
        self.db.insert({
            "id": 51,
            "filename": "other_text.pdf",
            "size": 10,
            "creation_date": datetime.today(),
        }, self.db.tables["Document"])

        response = self.application.get('/media/get_documents',
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
                    'creation_date': date.today().strftime("%Y-%m-%d"),
                    "filename": "empty_pdf.pdf",
                    "id": 50,
                    'keywords': None,
                    "size": 10,
                },
                {
                    'creation_date': date.today().strftime("%Y-%m-%d"),
                    "filename": "other_text.pdf",
                    "id": 51,
                    'keywords': None,
                    "size": 10,
                }
            ]
        }, response.json)

    @BaseCase.login
    def test_ok_with_filename_search(self, token):
        self.db.insert({
            "id": 50,
            "filename": "empty_pdf.pdf",
            "size": 10,
            "creation_date": datetime.today(),
        }, self.db.tables["Document"])
        self.db.insert({
            "id": 51,
            "filename": "other_text.pdf",
            "size": 10,
            "creation_date": datetime.today(),
        }, self.db.tables["Document"])

        response = self.application.get('/media/get_documents?search=empty',
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
                    'creation_date': date.today().strftime("%Y-%m-%d"),
                    "filename": "empty_pdf.pdf",
                    "id": 50,
                    'keywords': None,
                    "size": 10,
                },
            ]
        }, response.json)

    @BaseCase.login
    def test_ok_with_order(self, token):
        self.db.insert({
            "id": 50,
            "filename": "empty_pdf.pdf",
            "size": 10,
            "creation_date": datetime.today() - timedelta(1),
        }, self.db.tables["Document"])
        self.db.insert({
            "id": 51,
            "filename": "other_text.pdf",
            "size": 10,
            "creation_date": datetime.today(),
        }, self.db.tables["Document"])

        response = self.application.get('/media/get_documents?order=desc',
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
                    'creation_date': date.today().strftime("%Y-%m-%d"),
                    "filename": "other_text.pdf",
                    "id": 51,
                    'keywords': None,
                    "size": 10,
                },
                {
                    'creation_date': (date.today() - timedelta(1)).strftime("%Y-%m-%d"),
                    "filename": "empty_pdf.pdf",
                    "id": 50,
                    'keywords': None,
                    "size": 10,
                },
            ]
        }, response.json)

    @BaseCase.login
    def test_ok_with_keywords(self, token):
        self.db.insert({
            "id": 50,
            "filename": "empty_pdf.pdf",
            "size": 10,
            "creation_date": datetime.today() - timedelta(1),
            "keywords": "dog cat"
        }, self.db.tables["Document"])
        self.db.insert({
            "id": 51,
            "filename": "other_text.pdf",
            "size": 10,
            "creation_date": datetime.today(),
            "keywords": "word company"
        }, self.db.tables["Document"])

        response = self.application.get('/media/get_documents?search=comp',
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
                    'creation_date': date.today().strftime("%Y-%m-%d"),
                    "filename": "other_text.pdf",
                    "id": 51,
                    'keywords': 'word company',
                    "size": 10,
                },
            ]
        }, response.json)
