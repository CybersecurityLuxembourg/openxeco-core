from test.BaseCase import BaseCase
from utils.serializer import Serializer
from unittest.mock import patch
import json


class TestImportTaxonomy(BaseCase):

    @BaseCase.login
    @BaseCase.grant_access("/network/import_taxonomy")
    @patch('resource.network.import_taxonomy.request.get_request')
    def test_ok(self, mock_get_request, token):
        mock_get_request.return_value = json.dumps({
            "categories": [
                {"name": "CAT", "active_on_articles": True}
            ],
            "values": [
                {"id": 1, "category": "CAT", "name": "VAL"}
            ],
            "category_hierarchy": [],
            "value_hierarchy": []
        })

        self.db.insert({"id": 4, "api_endpoint": "https://random.url/feed"}, self.db.tables["NetworkNode"])
        self.db.insert({"name": "OTHER CAT"}, self.db.tables["TaxonomyCategory"])

        payload = {
            "network_node_id": 4,
            "taxonomy_category": "CAT",
        }

        response = self.application.post('/network/import_taxonomy',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        categories = self.db.get(self.db.tables["TaxonomyCategory"])
        values = self.db.get(self.db.tables["TaxonomyValue"])

        self.assertEqual(200, response.status_code)
        self.assertEqual(len(categories), 2)
        self.assertEqual(len(values), 1)
        self.assertEqual(
            Serializer.serialize(categories[0], self.db.tables["TaxonomyCategory"]),
            {
                'accepted_article_types': None,
                'active_on_articles': 1,
                'active_on_entities': 0,
                'is_standard': 0,
                'name': 'CAT',
                'sync_global': 0,
                'sync_hierarchy': 0,
                'sync_node': 4,
                'sync_status': 'OK',
                'sync_values': 0
            }
        )

    @BaseCase.login
    @BaseCase.grant_access("/network/import_taxonomy")
    @patch('resource.network.import_taxonomy.request.get_request')
    def test_ok_with_param_and_hierarchy(self, mock_get_request, token):
        mock_get_request.return_value = json.dumps({
            "categories": [
                {"name": "CAT", "active_on_articles": True, "active_on_entities": True, "is_standard": True,
                 "accepted_article_types": "JOB"},
                {"name": "PARENT CAT", "active_on_articles": True, "active_on_entities": True, "is_standard": True,
                 "accepted_article_types": "JOB"}
            ],
            "values": [
                {"id": 1, "category": "CAT", "name": "VAL"},
                {"id": 2, "category": "PARENT CAT", "name": "VAL2"}
            ],
            "category_hierarchy": [
                {"parent_category": "PARENT CAT", "child_category": "CAT"}
            ],
            "value_hierarchy": [
                {"parent_value": 2, "child_value": 1}
            ]
        })

        self.db.insert({"id": 4, "api_endpoint": "https://random.url/feed"}, self.db.tables["NetworkNode"])

        payload = {
            "network_node_id": 4,
            "taxonomy_category": "CAT",
            "sync_global": True,
            "sync_values": True,
            "sync_hierarchy": True,
        }

        response = self.application.post('/network/import_taxonomy',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        categories = self.db.get(self.db.tables["TaxonomyCategory"])
        values = self.db.get(self.db.tables["TaxonomyValue"])
        category_hierarchy = self.db.get(self.db.tables["TaxonomyCategoryHierarchy"])
        value_hierarchy = self.db.get(self.db.tables["TaxonomyValueHierarchy"])

        self.assertEqual(200, response.status_code)
        self.assertEqual(len(categories), 2)
        self.assertEqual(len(values), 2)
        self.assertEqual(len(category_hierarchy), 1)
        self.assertEqual(len(value_hierarchy), 1)
        self.assertEqual(
            Serializer.serialize(categories, self.db.tables["TaxonomyCategory"]),
            [
                {
                    'accepted_article_types': "JOB",
                    'active_on_articles': 1,
                    'active_on_entities': 1,
                    'is_standard': 1,
                    'name': 'CAT',
                    'sync_global': 1,
                    'sync_hierarchy': 1,
                    'sync_node': 4,
                    'sync_status': 'OK',
                    'sync_values': 1
                },
                {
                    'accepted_article_types': "JOB",
                    'active_on_articles': 1,
                    'active_on_entities': 1,
                    'is_standard': 1,
                    'name': 'PARENT CAT',
                    'sync_global': 1,
                    'sync_hierarchy': 1,
                    'sync_node': 4,
                    'sync_status': 'OK',
                    'sync_values': 1
                }
            ]
        )
        self.assertEqual(
            Serializer.serialize(category_hierarchy, self.db.tables["TaxonomyCategoryHierarchy"]),
            [{"parent_category": "PARENT CAT", "child_category": "CAT"}]
        )
        self.assertEqual(
            Serializer.serialize(value_hierarchy, self.db.tables["TaxonomyValueHierarchy"]),
            [{"parent_value": 2, "child_value": 1}]
        )

    @BaseCase.login
    @BaseCase.grant_access("/network/import_taxonomy")
    def test_ko_category_already_existing(self, token):
        self.db.insert({"name": "CAT"}, self.db.tables["TaxonomyCategory"])

        payload = {
            "network_node_id": 4,
            "taxonomy_category": "CAT",
        }

        response = self.application.post('/network/import_taxonomy',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual(
            "422 Object already existing : Taxonomy category with this name",
            response.status
        )

    @BaseCase.login
    @BaseCase.grant_access("/network/import_taxonomy")
    def test_ko_node_not_found(self, token):
        self.db.insert({"id": 5, "api_endpoint": "https://random.url/feed"}, self.db.tables["NetworkNode"])

        payload = {
            "network_node_id": 4,
            "taxonomy_category": "CAT",
        }

        response = self.application.post('/network/import_taxonomy',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual(
            "422 Object not found : Network node",
            response.status
        )

    @BaseCase.login
    @BaseCase.grant_access("/network/import_taxonomy")
    @patch('resource.network.import_taxonomy.request.get_request')
    def test_ko_remote_category_not_found(self, mock_get_request, token):
        mock_get_request.return_value = json.dumps({
            "categories": [],
            "values": [],
            "category_hierarchy": [],
            "value_hierarchy": []
        })

        self.db.insert({"id": 4, "api_endpoint": "https://random.url/feed"}, self.db.tables["NetworkNode"])

        payload = {
            "network_node_id": 4,
            "taxonomy_category": "CAT",
        }

        response = self.application.post('/network/import_taxonomy',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual(
            "422 Object not found : Taxonomy category on target node",
            response.status
        )

    @BaseCase.login
    @BaseCase.grant_access("/network/import_taxonomy")
    def test_ko_error_request(self, token):
        self.db.insert({"id": 4, "api_endpoint": "https://random.url/feed"}, self.db.tables["NetworkNode"])

        payload = {
            "network_node_id": 4,
            "taxonomy_category": "CAT",
        }

        response = self.application.post('/network/import_taxonomy',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual(
            "500 Error while fetching the network node taxonomy",
            response.status
        )
