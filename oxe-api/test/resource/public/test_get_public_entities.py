from test.BaseCase import BaseCase


class TestGetPublicEntities(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        self.db.insert({"id": 2, "name": "My Entity"}, self.db.tables["Entity"])
        self.db.insert({"id": 3, "name": "My Entity 2"}, self.db.tables["Entity"])
        self.db.insert({"id": 4, "name": "My Entity 3", "status": "INACTIVE"}, self.db.tables["Entity"])

        response = self.application.get('/public/get_public_entities',
                                        headers=self.get_standard_header(token))

        self.assertEqual(2, len(response.json))
        self.assertEqual(200, response.status_code)
        self.assertEqual(response.json, [
            {
                'id': 2,
                'image': None,
                'name': 'My Entity',
                'headline': None,
                'status': 'ACTIVE',
                'legal_status': 'JURIDICAL PERSON',
                'is_startup': 0,
                'is_cybersecurity_core_business': 0,
                'creation_date': None,
                'description': None,
                'sync_address': None,
                'sync_global': None,
                'sync_id': None,
                'sync_node': None,
                'sync_status': "OK",
                'trade_register_number': None,
                'website': None,
                'linkedin_url': None,
                'discord_url': None,
                'twitter_url': None,
                'youtube_url': None
            },
            {
                'id': 3,
                'image': None,
                'name': 'My Entity 2',
                'headline': None,
                'status': 'ACTIVE',
                'legal_status': 'JURIDICAL PERSON',
                'is_startup': 0,
                'is_cybersecurity_core_business': 0,
                'creation_date': None,
                'description': None,
                'sync_address': None,
                'sync_global': None,
                'sync_id': None,
                'sync_node': None,
                'sync_status': "OK",
                'trade_register_number': None,
                'website': None,
                'linkedin_url': None,
                'discord_url': None,
                'twitter_url': None,
                'youtube_url': None
            }
        ])

    @BaseCase.login
    def test_ok_with_inactive(self, token):
        self.db.insert({"id": 2, "name": "My Entity"}, self.db.tables["Entity"])
        self.db.insert({"id": 3, "name": "My Entity 2"}, self.db.tables["Entity"])
        self.db.insert({"id": 4, "name": "My Entity 3", "status": "INACTIVE"}, self.db.tables["Entity"])

        response = self.application.get('/public/get_public_entities?include_inactive=true',
                                        headers=self.get_standard_header(token))

        self.assertEqual(3, len(response.json))
        self.assertEqual(200, response.status_code)
        self.assertEqual(response.json, [
            {
                'id': 2,
                'image': None,
                'name': 'My Entity',
                'headline': None,
                'status': 'ACTIVE',
                'legal_status': 'JURIDICAL PERSON',
                'is_startup': 0,
                'is_cybersecurity_core_business': 0,
                'creation_date': None,
                'description': None,
                'sync_address': None,
                'sync_global': None,
                'sync_id': None,
                'sync_node': None,
                'sync_status': "OK",
                'trade_register_number': None,
                'website': None,
                'linkedin_url': None,
                'discord_url': None,
                'twitter_url': None,
                'youtube_url': None
            },
            {
                'id': 3,
                'image': None,
                'name': 'My Entity 2',
                'headline': None,
                'status': 'ACTIVE',
                'legal_status': 'JURIDICAL PERSON',
                'is_startup': 0,
                'is_cybersecurity_core_business': 0,
                'creation_date': None,
                'description': None,
                'sync_address': None,
                'sync_global': None,
                'sync_id': None,
                'sync_node': None,
                'sync_status': "OK",
                'trade_register_number': None,
                'website': None,
                'linkedin_url': None,
                'discord_url': None,
                'twitter_url': None,
                'youtube_url': None
            },
            {
                'id': 4,
                'image': None,
                'name': 'My Entity 3',
                'headline': None,
                'status': 'INACTIVE',
                'legal_status': 'JURIDICAL PERSON',
                'is_startup': 0,
                'is_cybersecurity_core_business': 0,
                'creation_date': None,
                'description': None,
                'sync_address': None,
                'sync_global': None,
                'sync_id': None,
                'sync_node': None,
                'sync_status': "OK",
                'trade_register_number': None,
                'website': None,
                'linkedin_url': None,
                'discord_url': None,
                'twitter_url': None,
                'youtube_url': None
            }
        ])
