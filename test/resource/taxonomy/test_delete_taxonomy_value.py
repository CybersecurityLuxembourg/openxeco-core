from test.BaseCase import BaseCase


class TestDeleteTaxonomyValue(BaseCase):

    @BaseCase.login
    @BaseCase.grant_access("/taxonomy/delete_taxonomy_value")
    def test_ok(self, token):
        self.db.insert({"name": "CAT1"}, self.db.tables["TaxonomyCategory"])
        self.db.insert({"id": 1, "name": "VAL1", "category": "CAT1"}, self.db.tables["TaxonomyValue"])

        payload = {
            "category": "CAT1",
            "name": "VAL1"
        }

        response = self.application.post('/taxonomy/delete_taxonomy_value',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual(200, response.status_code)
        self.assertEqual(self.db.get_count(self.db.tables["TaxonomyValue"]), 0)

    @BaseCase.login
    @BaseCase.grant_access("/taxonomy/delete_taxonomy_value")
    def test_delete_unexisting(self, token):
        payload = {
            "category": "CAT1",
            "name": "VAL1"
        }

        response = self.application.post('/taxonomy/delete_taxonomy_value',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual(500, response.status_code)
        self.assertEqual("500 Object not found", response.status)
