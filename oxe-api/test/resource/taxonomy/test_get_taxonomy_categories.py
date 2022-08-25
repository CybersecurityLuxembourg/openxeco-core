from test.BaseCase import BaseCase


class TestGetTaxonomyCategories(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        self.db.insert({"name": "CAT1"}, self.db.tables["TaxonomyCategory"])
        self.db.insert({"name": "CAT2"}, self.db.tables["TaxonomyCategory"])

        response = self.application.get('/taxonomy/get_taxonomy_categories',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)
        self.assertEqual([
            {
                'accepted_article_types': None,
                'active_on_articles': 0,
                'active_on_entities': 0,
                'is_standard': 0,
                'name': 'CAT1',
                'sync_global': None,
                'sync_hierarchy': None,
                'sync_node': None,
                'sync_status': "OK",
                'sync_values': None
            },
            {
                'accepted_article_types': None,
                'active_on_articles': 0,
                'active_on_entities': 0,
                'is_standard': 0,
                'name': 'CAT2',
                'sync_global': None,
                'sync_hierarchy': None,
                'sync_node': None,
                'sync_status': "OK",
                'sync_values': None
            },
        ], response.json)

    @BaseCase.login
    def test_ok_empty(self, token):
        response = self.application.get('/taxonomy/get_taxonomy_categories',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)
        self.assertEqual([], response.json)
