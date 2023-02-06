from test.BaseCase import BaseCase


class TestGetPublicEntity(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        self.db.insert({"id": 2, "name": "My Entity"}, self.db.tables["Entity"])

        response = self.application.get('/public/get_public_entity/2',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)
        self.assertEqual(response.json, {
            'id': 2,
            'image': None,
            'name': 'My Entity',
            'headline': None,
            'status': 'ACTIVE',
            'legal_status': 'JURIDICAL PERSON',
            'is_startup': 0,
            'is_cybersecurity_core_business': 0,
            'closure_date': None,
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
            'youtube_url': None,
            'github_url': None,
            'mastodon_url': None
        })

    @BaseCase.login
    def test_ok_with_assignments(self, token):
        self.db.insert({"id": 2, "name": "My Entity"}, self.db.tables["Entity"])

        response = self.application.get('/public/get_public_entity/2?include_assignments=True',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)
        self.assertEqual(response.json, {
            'id': 2,
            'image': None,
            'name': 'My Entity',
            'headline': None,
            'status': 'ACTIVE',
            'legal_status': 'JURIDICAL PERSON',
            'is_startup': 0,
            'is_cybersecurity_core_business': 0,
            'closure_date': None,
            'creation_date': None,
            'description': None,
            'sync_address': None,
            'sync_global': None,
            'sync_id': None,
            'sync_node': None,
            'sync_status': "OK",
            'taxonomy_assignment': [],
            'trade_register_number': None,
            'website': None,
            'linkedin_url': None,
            'discord_url': None,
            'twitter_url': None,
            'youtube_url': None,
            'github_url': None,
            'mastodon_url': None
        })

    @BaseCase.login
    def test_unexisting_id(self, token):
        response = self.application.get('/public/get_public_entity/4',
                                        headers=self.get_standard_header(token))

        self.assertEqual("422 Object not found", response.status)

    @BaseCase.login
    def test_ko_deleted_status_entity(self, token):
        self.db.insert({"id": 4, "name": "My Entity", "status": "DELETED"}, self.db.tables["Entity"])

        response = self.application.get('/public/get_public_entity/4',
                                        headers=self.get_standard_header(token))

        self.assertEqual("422 Object not found", response.status)
