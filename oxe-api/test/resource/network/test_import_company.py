from test.BaseCase import BaseCase
from utils.serializer import Serializer
from unittest.mock import patch
import json


class TestImportCompany(BaseCase):

    @BaseCase.login
    @BaseCase.grant_access("/network/import_company")
    @patch('resource.network.import_taxonomy.request.get_request')
    def test_ok(self, mock_get_request, token):
        mock_get_request.side_effect = [
            json.dumps({
                "creation_date": None,
                "description": None,
                "id": 1,
                "image": None,
                "is_startup": 0,
                "name": "My Company",
                "status": "ACTIVE",
                "trade_register_number": None,
                "website": None
            }),
            json.dumps([])
        ]

        self.db.insert({"id": 4, "api_endpoint": "https://random.url/feed"}, self.db.tables["NetworkNode"])

        payload = {
            "network_node_id": 4,
            "company_id": 1,
        }

        response = self.application.post('/network/import_company',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        companies = self.db.get(self.db.tables["Company"])
        addresses = self.db.get(self.db.tables["CompanyAddress"])

        self.assertEqual(200, response.status_code)
        self.assertEqual(len(companies), 1)
        self.assertEqual(len(addresses), 0)
        self.assertEqual(
            Serializer.serialize(companies, self.db.tables["Company"]),
            [{
                'creation_date': None,
                'description': None,
                'discord_url': None,
                'id': 1,
                'image': None,
                'is_cybersecurity_core_business': 0,
                'is_startup': 0,
                'linkedin_url': None,
                'name': 'My Company',
                'status': 'ACTIVE',
                'sync_address': 0,
                'sync_global': 0,
                'sync_id': 1,
                'sync_node': 4,
                'sync_status': 'OK',
                'trade_register_number': None,
                'twitter_url': None,
                'website': None,
                'youtube_url': None
            }]
        )

    @BaseCase.login
    @BaseCase.grant_access("/network/import_company")
    @patch('resource.network.import_taxonomy.request.get_request')
    def test_ok_with_param_and_address(self, mock_get_request, token):
        mock_get_request.side_effect = [
            json.dumps({
                "creation_date": None,
                "description": None,
                "id": 1,
                "image": None,
                "is_startup": 0,
                "name": "My Company",
                "status": "ACTIVE",
                "trade_register_number": None,
                "website": None
            }),
            json.dumps([
                {
                    "address_1": "a",
                    "address_2": "b",
                    "administrative_area": "c",
                    "city": "d",
                    "company_id": 1,
                    "country": "e",
                    "id": 1,
                    "latitude": 2,
                    "longitude": 3,
                    "number": "f",
                    "postal_code": "g"
                }
            ])
        ]

        self.db.insert({"id": 4, "api_endpoint": "https://random.url/feed"}, self.db.tables["NetworkNode"])

        payload = {
            "network_node_id": 4,
            "company_id": 1,
            'sync_global': True,
            'sync_address': True,
        }

        response = self.application.post('/network/import_company',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        companies = self.db.get(self.db.tables["Company"])
        addresses = self.db.get(self.db.tables["CompanyAddress"])

        self.assertEqual(200, response.status_code)
        self.assertEqual(len(companies), 1)
        self.assertEqual(len(addresses), 1)
        self.assertEqual(
            Serializer.serialize(companies, self.db.tables["Company"]),
            [{
                'creation_date': None,
                'description': None,
                'discord_url': None,
                'id': 1,
                'image': None,
                'is_cybersecurity_core_business': 0,
                'is_startup': 0,
                'linkedin_url': None,
                'name': 'My Company',
                'status': 'ACTIVE',
                'sync_address': 1,
                'sync_global': 1,
                'sync_id': 1,
                'sync_node': 4,
                'sync_status': 'OK',
                'trade_register_number': None,
                'twitter_url': None,
                'website': None,
                'youtube_url': None
            }]
        )
        self.assertEqual(
            Serializer.serialize(addresses, self.db.tables["CompanyAddress"]),
            [
                {
                    "address_1": "a",
                    "address_2": "b",
                    "administrative_area": "c",
                    "city": "d",
                    "company_id": 1,
                    "country": "e",
                    "id": 1,
                    "latitude": 2,
                    "longitude": 3,
                    "number": "f",
                    "postal_code": "g"
                }
            ]
        )

    @BaseCase.login
    @BaseCase.grant_access("/network/import_company")
    def test_ko_node_not_found(self, token):
        self.db.insert({"id": 5, "api_endpoint": "https://random.url/feed"}, self.db.tables["NetworkNode"])

        payload = {
            "network_node_id": 4,
            "company_id": 1,
        }

        response = self.application.post('/network/import_company',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual(
            "422 Object not found : Network node",
            response.status
        )

    @BaseCase.login
    @BaseCase.grant_access("/network/import_company")
    @patch('resource.network.import_taxonomy.request.get_request')
    def test_ko_remote_company_not_found(self, mock_get_request, token):
        mock_get_request.return_value = json.dumps({
            "categories": [],
            "values": [],
            "category_hierarchy": [],
            "value_hierarchy": []
        })

        self.db.insert({"id": 4, "api_endpoint": "https://random.url/feed"}, self.db.tables["NetworkNode"])

        payload = {
            "network_node_id": 4,
            "company_id": 1,
        }

        response = self.application.post('/network/import_company',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual(
            "500 Error while fetching the network node company",
            response.status
        )

    @BaseCase.login
    @BaseCase.grant_access("/network/import_company")
    def test_ko_error_request(self, token):
        self.db.insert({"id": 4, "api_endpoint": "https://random.url/feed"}, self.db.tables["NetworkNode"])

        payload = {
            "network_node_id": 4,
            "company_id": 1,
        }

        response = self.application.post('/network/import_company',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual(
            "500 Error while fetching the network node company",
            response.status
        )
