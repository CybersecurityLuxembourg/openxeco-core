from test.BaseCase import BaseCase


class TestDeleteTaxonomyTag(BaseCase):

    @BaseCase.login
    @BaseCase.grant_access("/article/delete_taxonomy_tag")
    def test_ok(self, token):
        self.db.insert({"id": 1, "title": "My article"}, self.db.tables["Article"])
        self.db.insert({"name": "CAT"}, self.db.tables["TaxonomyCategory"])
        self.db.insert({"id": 1, "name": "VALUE", "category": "CAT"}, self.db.tables["TaxonomyValue"])
        self.db.insert({"article": 1, "taxonomy_value": 1}, self.db.tables["ArticleTaxonomyTag"])

        payload = {
            "article": 1,
            "taxonomy_value": 1,
        }

        response = self.application.post('/article/delete_taxonomy_tag',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual(200, response.status_code)
        self.assertEqual(self.db.get_count(self.db.tables["Article"]), 1)
        self.assertEqual(self.db.get_count(self.db.tables["TaxonomyValue"]), 1)
        self.assertEqual(self.db.get_count(self.db.tables["ArticleTaxonomyTag"]), 0)

    @BaseCase.login
    @BaseCase.grant_access("/article/delete_taxonomy_tag")
    def test_delete_unexisting(self, token):
        payload = {
            "article": 1,
            "taxonomy_value": 1,
        }

        response = self.application.post('/article/delete_taxonomy_tag',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual(500, response.status_code)
        self.assertEqual("500 Object not found", response.status)
