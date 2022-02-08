from test.BaseCase import BaseCase


class TestGetTaxonomyCategoryHierarchy(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        self.db.insert({"name": "CAT1"}, self.db.tables["TaxonomyCategory"])
        self.db.insert({"name": "CAT2"}, self.db.tables["TaxonomyCategory"])
        self.db.insert({"parent_category": "CAT1", "child_category": "CAT2"},
                       self.db.tables["TaxonomyCategoryHierarchy"])

        response = self.application.get('/taxonomy/get_taxonomy_category_hierarchy',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)
        self.assertEqual([{"parent_category": "CAT1", "child_category": "CAT2"}], response.json)

    @BaseCase.login
    def test_ok_empty(self, token):
        response = self.application.get('/taxonomy/get_taxonomy_category_hierarchy',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)
        self.assertEqual([], response.json)
