from test.BaseCase import BaseCase


class TestGetPublicAnalytics(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        self.db.insert({
            "name": "My entity",
            "creation_date": "2020-06-06",
        }, self.db.tables["Entity"])
        self.db.insert({
            "name": "My entity 2",
            "creation_date": None,
        }, self.db.tables["Entity"])
        self.db.insert({
            "name": "My entity 3",
            "creation_date": None,
        }, self.db.tables["Entity"])

        response = self.application.get('/public/get_public_analytics',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)
        self.assertEqual(response.json, {
            'workforces': [],
            'taxonomy_categories': [],
            'taxonomy_category_hierarchy': [],
            'taxonomy_values': [],
            'taxonomy_value_hierarchy': [], 'taxonomy_assignments': []
        })
