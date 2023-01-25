from test.BaseCase import BaseCase


class TestGetArticleTags(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        self.db.insert({"id": 1, "title": "TITLE"}, self.db.tables["Article"])

        self.db.insert({"id": 10, "name": "ENTITY"}, self.db.tables["Entity"])
        self.db.insert({"id": 11, "name": "ENTITY2"}, self.db.tables["Entity"])
        self.db.insert({"article_id": 1, "entity_id": 10}, self.db.tables["ArticleEntityTag"])
        self.db.insert({"article_id": 1, "entity_id": 11}, self.db.tables["ArticleEntityTag"])

        self.db.insert({"name": "CAT"}, self.db.tables["TaxonomyCategory"])
        self.db.insert({"id": 100, "name": "VALUE", "category": "CAT"}, self.db.tables["TaxonomyValue"])
        self.db.insert({"article_id": 1, "taxonomy_value_id": 100}, self.db.tables["ArticleTaxonomyTag"])

        response = self.application.get('/article/get_article_tags/1',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)
        self.assertEqual({
            'entity_tags': [
                {
                    'creation_date': None,
                    'description': None,
                    'discord_url': None,
                    'status': 'ACTIVE',
                    'legal_status': 'JURIDICAL PERSON',
                    'sync_address': None,
                    'sync_global': None,
                    'sync_id': None,
                    'sync_node': None,
                    'sync_status': 'OK',
                    'id': 10,
                    'image': None,
                    'is_cybersecurity_core_business': 0,
                    'is_startup': 0,
                    'headline': None,
                    'linkedin_url': None,
                    'name': 'ENTITY',
                    'trade_register_number': None,
                    'twitter_url': None,
                    'website': None,
                    'youtube_url': None,
                    'github_url': None,
                    'mastodon_url': None
                },
                {
                    'creation_date': None,
                    'description': None,
                    'discord_url': None,
                    'status': 'ACTIVE',
                    'legal_status': 'JURIDICAL PERSON',
                    'sync_address': None,
                    'sync_global': None,
                    'sync_id': None,
                    'sync_node': None,
                    'sync_status': 'OK',
                    'id': 11,
                    'image': None,
                    'is_cybersecurity_core_business': 0,
                    'is_startup': 0,
                    'headline': None,
                    'linkedin_url': None,
                    'name': 'ENTITY2',
                    'trade_register_number': None,
                    'twitter_url': None,
                    'website': None,
                    'youtube_url': None,
                    'github_url': None,
                    'mastodon_url': None
                }],
            'taxonomy_tags': [
                {
                    'category': 'CAT',
                    'id': 100,
                    'name': 'VALUE'
                }
            ]
        }, response.json)

    @BaseCase.login
    def test_ok_empty(self, token):
        response = self.application.get('/article/get_article/2',
                                        headers=self.get_standard_header(token))

        self.assertEqual("422 Object not found", response.status)
