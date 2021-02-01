from test.BaseCase import BaseCase


class TestGetCompanyTaxonomy(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        self.db.insert({"id": 1, "name": "My Company"}, self.db.tables["Company"])
        self.db.insert({"id": 2, "name": "My Company 2"}, self.db.tables["Company"])
        self.db.insert({"name": "CAT1"}, self.db.tables["TaxonomyCategory"])
        self.db.insert({"name": "CAT2"}, self.db.tables["TaxonomyCategory"])
        self.db.insert({"id": 1, "name": "VAL1", "category": "CAT1"}, self.db.tables["TaxonomyValue"])
        self.db.insert({"id": 2, "name": "VAL2", "category": "CAT2"}, self.db.tables["TaxonomyValue"])
        self.db.insert({"company": 1, "taxonomy_value": 1}, self.db.tables["TaxonomyAssignment"])
        self.db.insert({"company": 1, "taxonomy_value": 2}, self.db.tables["TaxonomyAssignment"])
        self.db.insert({"company": 2, "taxonomy_value": 2}, self.db.tables["TaxonomyAssignment"])

        response = self.application.get('/company/get_company_taxonomy/2',
                                        headers=self.get_standard_header(token))

        self.assertEqual([{'company': 2, 'taxonomy_value': 2}], response.json)
        self.assertEqual(200, response.status_code)

    @BaseCase.login
    def test_ok_empty(self, token):
        self.db.insert({"id": 2, "name": "My Company"}, self.db.tables["Company"])

        response = self.application.get('/company/get_company_taxonomy/2',
                                        headers=self.get_standard_header(token))

        self.assertEqual(response.json, [])
        self.assertEqual(200, response.status_code)
