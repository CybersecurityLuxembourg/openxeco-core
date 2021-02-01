from test.BaseCase import BaseCase


class TestDeleteTaxonomyCategory(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        self.db.insert({"name": "CAT1"}, self.db.tables["TaxonomyCategory"])

        payload = {"category": "CAT1"}

        response = self.application.post('/taxonomy/delete_taxonomy_category',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual(200, response.status_code)
        self.assertEqual(self.db.get_count(self.db.tables["TaxonomyCategory"]), 0)

    @BaseCase.login
    def test_delete_unexisting(self, token):
        payload = {"category": "CAT1"}

        response = self.application.post('/taxonomy/delete_taxonomy_category',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual(500, response.status_code)
        self.assertEqual("500 Object not found", response.status)
