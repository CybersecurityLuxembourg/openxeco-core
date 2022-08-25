from test.BaseCase import BaseCase


class TestGetEntityTaxonomy(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        self.db.insert({"id": 1, "name": "My Entity"}, self.db.tables["Entity"])
        self.db.insert({"id": 2, "name": "My Entity 2"}, self.db.tables["Entity"])
        self.db.insert({"name": "CAT1"}, self.db.tables["TaxonomyCategory"])
        self.db.insert({"name": "CAT2"}, self.db.tables["TaxonomyCategory"])
        self.db.insert({"id": 1, "name": "VAL1", "category": "CAT1"}, self.db.tables["TaxonomyValue"])
        self.db.insert({"id": 2, "name": "VAL2", "category": "CAT2"}, self.db.tables["TaxonomyValue"])
        self.db.insert({"entity": 1, "taxonomy_value": 1}, self.db.tables["TaxonomyAssignment"])
        self.db.insert({"entity": 1, "taxonomy_value": 2}, self.db.tables["TaxonomyAssignment"])
        self.db.insert({"entity": 2, "taxonomy_value": 2}, self.db.tables["TaxonomyAssignment"])

        response = self.application.get('/entity/get_entity_taxonomy/2',
                                        headers=self.get_standard_header(token))

        self.assertEqual([{'entity': 2, 'taxonomy_value': 2}], response.json)
        self.assertEqual(200, response.status_code)

    @BaseCase.login
    def test_ok_empty(self, token):
        self.db.insert({"id": 2, "name": "My Entity"}, self.db.tables["Entity"])

        response = self.application.get('/entity/get_entity_taxonomy/2',
                                        headers=self.get_standard_header(token))

        self.assertEqual(response.json, [])
        self.assertEqual(200, response.status_code)
