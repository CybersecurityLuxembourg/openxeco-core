from test.BaseCase import BaseCase


class TestGetTaxonomyValueHierarchy(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        self.db.insert({"name": "CAT1"}, self.db.tables["TaxonomyCategory"])
        self.db.insert({"name": "CAT2"}, self.db.tables["TaxonomyCategory"])
        self.db.insert({"parent_category": "CAT1", "child_category": "CAT2"},
                       self.db.tables["TaxonomyCategoryHierarchy"])
        self.db.insert({"id": 1, "name": "VAL1", "category": "CAT1"}, self.db.tables["TaxonomyValue"])
        self.db.insert({"id": 2, "name": "VAL2", "category": "CAT2"}, self.db.tables["TaxonomyValue"])
        self.db.insert({"parent_value": 1, "child_value": 2}, self.db.tables["TaxonomyValueHierarchy"])

        response = self.application.get(
            '/taxonomy/get_taxonomy_value_hierarchy?parent_category=CAT1&child_category=CAT2',
            headers=self.get_standard_header(token)
        )

        self.assertEqual(200, response.status_code)
        self.assertEqual({
            'parent_values': [{'id': 1, 'name': 'VAL1', 'category': 'CAT1'}],
            'child_values': [{'id': 2, 'name': 'VAL2', 'category': 'CAT2'}],
            'value_hierarchy': [{'parent_value': 1, 'child_value': 2}]
        }, response.json)

    @BaseCase.login
    def test_ok_empty(self, token):
        self.db.insert({"name": "CAT1"}, self.db.tables["TaxonomyCategory"])
        self.db.insert({"name": "CAT2"}, self.db.tables["TaxonomyCategory"])
        self.db.insert({"parent_category": "CAT1", "child_category": "CAT2"},
                       self.db.tables["TaxonomyCategoryHierarchy"])

        response = self.application.get(
            '/taxonomy/get_taxonomy_value_hierarchy?parent_category=CAT1&child_category=CAT2',
            headers=self.get_standard_header(token)
        )

        self.assertEqual(200, response.status_code)
        self.assertEqual({'parent_values': [], 'child_values': [], 'value_hierarchy': []}, response.json)

    @BaseCase.login
    def test_ko_missing_parent_param(self, token):
        response = self.application.get('/taxonomy/get_taxonomy_value_hierarchy?child_category=CAT2',
                                        headers=self.get_standard_header(token))

        self.assertEqual(422, response.status_code)
        self.assertEqual("422 Parent category is missing as parameter", response.status)

    @BaseCase.login
    def test_ko_missing_child_param(self, token):
        response = self.application.get('/taxonomy/get_taxonomy_value_hierarchy?parent_category=CAT1',
                                        headers=self.get_standard_header(token))

        self.assertEqual(422, response.status_code)
        self.assertEqual("422 Child category is missing as parameter", response.status)

    @BaseCase.login
    def test_ko_missing_hierarchy(self, token):
        response = self.application.get(
            '/taxonomy/get_taxonomy_value_hierarchy?parent_category=CAT1&child_category=CAT2',
            headers=self.get_standard_header(token)
        )

        self.assertEqual(422, response.status_code)
        self.assertEqual("422 The relation between those two categories does not exist", response.status)
