from test.BaseCase import BaseCase
from utils.serializer import Serializer
from unittest.mock import patch
import json


class TestImportArticle(BaseCase):

    @BaseCase.login
    @BaseCase.grant_access("/network/import_article")
    @patch('resource.network.import_taxonomy.request.get_request')
    def test_ok(self, mock_get_request, token):
        mock_get_request.side_effect = [
            json.dumps({
                "abstract": "a",
                "end_date": "2022-06-23T00:00:00",
                "external_reference": "b",
                "handle": "c",
                "id": 1,
                "image": None,
                "is_created_by_admin": 1,
                "link": "d",
                "publication_date": "2022-03-21T00:00:00",
                "start_date": "2022-06-16T00:00:00",
                "status": "PUBLIC",
                "sync_content": True,
                "sync_global": True,
                "sync_id": 42,
                "sync_node": 42,
                "sync_status": "OK",
                "title": "e",
                "type": "NEWS"
            }),
            json.dumps({
                "content": []
            })
        ]

        self.db.insert({"id": 4, "api_endpoint": "https://random.url/feed"}, self.db.tables["NetworkNode"])

        payload = {
            "network_node_id": 4,
            "article_id": 1,
        }

        response = self.application.post('/network/import_article',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        articles = self.db.get(self.db.tables["Article"])
        article_boxes = self.db.get(self.db.tables["ArticleBox"])

        self.assertEqual(200, response.status_code)
        self.assertEqual(len(articles), 1)
        self.assertEqual(len(article_boxes), 0)
        self.assertEqual(
            Serializer.serialize(articles, self.db.tables["Article"]),
            [{
                "abstract": "a",
                "end_date": "2022-06-23T00:00:00",
                "external_reference": "b",
                "handle": "c",
                "id": 1,
                "image": None,
                "is_created_by_admin": 1,
                "link": "d",
                "publication_date": "2022-03-21T00:00:00",
                "start_date": "2022-06-16T00:00:00",
                "status": "PUBLIC",
                "sync_content": 0,
                "sync_global": 0,
                "sync_id": 1,
                "sync_node": 4,
                "sync_status": "OK",
                "title": "e",
                "type": "NEWS"
            }]
        )

    @BaseCase.login
    @BaseCase.grant_access("/network/import_article")
    @patch('resource.network.import_taxonomy.request.get_request')
    def test_ok_with_param_and_content(self, mock_get_request, token):
        mock_get_request.side_effect = [
            json.dumps({
                "abstract": "a",
                "end_date": "2022-06-23T00:00:00",
                "external_reference": "b",
                "handle": "c",
                "id": 1,
                "image": None,
                "is_created_by_admin": 1,
                "link": "d",
                "publication_date": "2022-03-21T00:00:00",
                "start_date": "2022-06-16T00:00:00",
                "status": "PUBLIC",
                "sync_content": True,
                "sync_global": True,
                "sync_id": 42,
                "sync_node": 42,
                "sync_status": "OK",
                "title": "e",
                "type": "NEWS"
            }),
            json.dumps({
                "content": [
                    {
                        "article_version_id": 159,
                        "content": "1",
                        "id": 157,
                        "position": 1,
                        "type": "TITLE1"
                    },
                    {
                        "article_version_id": 159,
                        "content": "2",
                        "id": 158,
                        "position": 2,
                        "type": "TITLE2"
                    },
                    {
                        "article_version_id": 159,
                        "content": "<p>3</p>",
                        "id": 159,
                        "position": 3,
                        "type": "PARAGRAPH"
                    },
                    {
                        "article_version_id": 159,
                        "content": None,
                        "id": 160,
                        "position": 4,
                        "type": "IMAGE"
                    },
                    {
                        "article_version_id": 159,
                        "content": "4",
                        "id": 161,
                        "position": 5,
                        "type": "FRAME"
                    }
                ],
            })
        ]

        self.db.insert({"id": 4, "api_endpoint": "https://random.url/feed"}, self.db.tables["NetworkNode"])

        payload = {
            "network_node_id": 4,
            "article_id": 1,
            'sync_global': True,
            'sync_content': True,
        }

        response = self.application.post('/network/import_article',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        articles = self.db.get(self.db.tables["Article"])
        article_boxes = self.db.get(self.db.tables["ArticleBox"])

        self.assertEqual(200, response.status_code)
        self.assertEqual(len(articles), 1)
        self.assertEqual(len(article_boxes), 5)
        self.assertEqual(
            Serializer.serialize(articles, self.db.tables["Article"]),
            [{
                "abstract": "a",
                "end_date": "2022-06-23T00:00:00",
                "external_reference": "b",
                "handle": "c",
                "id": 1,
                "image": None,
                "is_created_by_admin": 1,
                "link": "d",
                "publication_date": "2022-03-21T00:00:00",
                "start_date": "2022-06-16T00:00:00",
                "status": "PUBLIC",
                "sync_content": 1,
                "sync_global": 1,
                "sync_id": 1,
                "sync_node": 4,
                "sync_status": "OK",
                "title": "e",
                "type": "NEWS"
            }]
        )
        self.assertEqual(
            Serializer.serialize(article_boxes, self.db.tables["ArticleBox"]),
            [
                {
                    "article_version_id": 1,
                    "content": "1",
                    "id": 1,
                    "position": 1,
                    "type": "TITLE1"
                },
                {
                    "article_version_id": 1,
                    "content": "2",
                    "id": 2,
                    "position": 2,
                    "type": "TITLE2"
                },
                {
                    "article_version_id": 1,
                    "content": "<p>3</p>",
                    "id": 3,
                    "position": 3,
                    "type": "PARAGRAPH"
                },
                {
                    "article_version_id": 1,
                    "content": None,
                    "id": 4,
                    "position": 4,
                    "type": "IMAGE"
                },
                {
                    "article_version_id": 1,
                    "content": "4",
                    "id": 5,
                    "position": 5,
                    "type": "FRAME"
                }
            ]
        )

    @BaseCase.login
    @BaseCase.grant_access("/network/import_article")
    def test_ko_node_not_found(self, token):
        self.db.insert({"id": 5, "api_endpoint": "https://random.url/feed"}, self.db.tables["NetworkNode"])

        payload = {
            "network_node_id": 4,
            "article_id": 1,
        }

        response = self.application.post('/network/import_article',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual(
            "422 Object not found : Network node",
            response.status
        )

    @BaseCase.login
    @BaseCase.grant_access("/network/import_article")
    def test_ko_error_request(self, token):
        self.db.insert({"id": 4, "api_endpoint": "https://random.url/feed"}, self.db.tables["NetworkNode"])

        payload = {
            "network_node_id": 4,
            "article_id": 1,
        }

        response = self.application.post('/network/import_article',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual(
            "500 Error while fetching the network node article",
            response.status
        )
