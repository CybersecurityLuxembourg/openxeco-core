from test.BaseCase import BaseCase


class TestUpdateTaxonomyCategory(BaseCase):

    @BaseCase.login
    @BaseCase.grant_access("/taxonomy/update_taxonomy_category")
    def test_ok(self, token):
        self.db.insert({
            "name": "CAT",
        }, self.db.tables["TaxonomyCategory"])

        payload = {
            "name": "CAT",
            "active_on_companies": True,
        }

        response = self.application.post('/taxonomy/update_taxonomy_category',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        users = self.db.get(self.db.tables["TaxonomyCategory"], {"name": "CAT"})

        self.assertEqual(200, response.status_code)
        self.assertEqual(len(users), 1)
        self.assertEqual(users[0].active_on_companies, 1)
