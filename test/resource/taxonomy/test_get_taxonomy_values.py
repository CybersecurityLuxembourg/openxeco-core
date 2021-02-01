from test.BaseCase import BaseCase


class TestGetTaxonomyValues(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        self.db.insert({"name": "CAT1"}, self.db.tables["TaxonomyCategory"])
        self.db.insert({"name": "CAT2"}, self.db.tables["TaxonomyCategory"])
        self.db.insert({"id": 1, "name": "VAL1", "category": "CAT1"}, self.db.tables["TaxonomyValue"])
        self.db.insert({"id": 2, "name": "VAL2", "category": "CAT1"}, self.db.tables["TaxonomyValue"])
        self.db.insert({"id": 3, "name": "VAL3", "category": "CAT2"}, self.db.tables["TaxonomyValue"])
        self.db.insert({"id": 4, "name": "VAL4", "category": "CAT2"}, self.db.tables["TaxonomyValue"])

        response = self.application.get('/taxonomy/get_taxonomy_values',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)
        self.assertEqual([{"id": 1, "name": "VAL1", "category": "CAT1"},
                          {"id": 2, "name": "VAL2", "category": "CAT1"},
                          {"id": 3, "name": "VAL3", "category": "CAT2"},
                          {"id": 4, "name": "VAL4", "category": "CAT2"}], response.json)

    @BaseCase.login
    def test_ok_with_category(self, token):
        self.db.insert({"name": "CAT1"}, self.db.tables["TaxonomyCategory"])
        self.db.insert({"name": "CAT2"}, self.db.tables["TaxonomyCategory"])
        self.db.insert({"id": 1, "name": "VAL1", "category": "CAT1"}, self.db.tables["TaxonomyValue"])
        self.db.insert({"id": 2, "name": "VAL2", "category": "CAT1"}, self.db.tables["TaxonomyValue"])
        self.db.insert({"id": 3, "name": "VAL3", "category": "CAT2"}, self.db.tables["TaxonomyValue"])
        self.db.insert({"id": 4, "name": "VAL4", "category": "CAT2"}, self.db.tables["TaxonomyValue"])

        response = self.application.get('/taxonomy/get_taxonomy_values?category=CAT1',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)
        self.assertEqual([{"id": 1, "name": "VAL1", "category": "CAT1"},
                          {"id": 2, "name": "VAL2", "category": "CAT1"}], response.json)

    @BaseCase.login
    def test_ok_empty(self, token):
        response = self.application.get('/taxonomy/get_taxonomy_values',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)
        self.assertEqual([], response.json)