from test.BaseCase import BaseCase


class TestGetPublicTaxonomyValues(BaseCase):

    def test_ok(self):
        self.db.insert({"name": "CAT1"}, self.db.tables["TaxonomyCategory"])
        self.db.insert({"name": "CAT2"}, self.db.tables["TaxonomyCategory"])
        self.db.insert({"id": 1, "name": "VAL1", "category": "CAT1"}, self.db.tables["TaxonomyValue"])
        self.db.insert({"id": 2, "name": "VAL2", "category": "CAT1"}, self.db.tables["TaxonomyValue"])
        self.db.insert({"id": 3, "name": "VAL3", "category": "CAT2"}, self.db.tables["TaxonomyValue"])
        self.db.insert({"id": 4, "name": "VAL4", "category": "CAT2"}, self.db.tables["TaxonomyValue"])

        response = self.application.get('/public/get_public_taxonomy_values')

        self.assertEqual(200, response.status_code)
        self.assertEqual([{"id": 1, "name": "VAL1", "category": "CAT1"},
                          {"id": 2, "name": "VAL2", "category": "CAT1"},
                          {"id": 3, "name": "VAL3", "category": "CAT2"},
                          {"id": 4, "name": "VAL4", "category": "CAT2"}], response.json)

    def test_ok_empty(self):
        response = self.application.get('/public/get_public_taxonomy_values')

        self.assertEqual(200, response.status_code)
        self.assertEqual([], response.json)
