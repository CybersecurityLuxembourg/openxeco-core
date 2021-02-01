from test.BaseCase import BaseCase


class TestDeleteTaxonomyCategoryHierarchy(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        self.db.insert({"name": "CAT1"}, self.db.tables["TaxonomyCategory"])
        self.db.insert({"name": "CAT2"}, self.db.tables["TaxonomyCategory"])
        self.db.insert({"parent_category": "CAT1", "child_category": "CAT2"},
                       self.db.tables["TaxonomyCategoryHierarchy"])

        payload = {
            "parent_category": "CAT1",
            "child_category": "CAT2"
        }

        response = self.application.post('/taxonomy/delete_taxonomy_category_hierarchy',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual(200, response.status_code)
        self.assertEqual(self.db.get_count(self.db.tables["TaxonomyCategoryHierarchy"]), 0)

    @BaseCase.login
    def test_delete_unexisting(self, token):
        payload = {
            "parent_category": "CAT1",
            "child_category": "CAT2"
        }

        response = self.application.post('/taxonomy/delete_taxonomy_category_hierarchy',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual(500, response.status_code)
        self.assertEqual("500 Object not found", response.status)
