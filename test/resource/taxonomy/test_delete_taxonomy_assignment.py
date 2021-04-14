from test.BaseCase import BaseCase


class TestDeleteTaxonomyAssignment(BaseCase):

    @BaseCase.login
    @BaseCase.grant_access("/taxonomy/delete_taxonomy_assignment")
    def test_ok(self, token):
        self.db.insert({"id": 1, "name": "My Company"}, self.db.tables["Company"])
        self.db.insert({"name": "CAT1"}, self.db.tables["TaxonomyCategory"])
        self.db.insert({"id": 1, "name": "My Value", "category": "CAT1"}, self.db.tables["TaxonomyValue"])
        self.db.insert({"company": 1, "taxonomy_value": 1}, self.db.tables["TaxonomyAssignment"])

        payload = {"company": 1, "value": 1}

        response = self.application.post('/taxonomy/delete_taxonomy_assignment',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual(200, response.status_code)
        self.assertEqual(self.db.get_count(self.db.tables["TaxonomyAssignment"]), 0)

    @BaseCase.login
    @BaseCase.grant_access("/taxonomy/delete_taxonomy_assignment")
    def test_delete_unexisting(self, token):
        payload = {"company": 1, "value": 1}

        response = self.application.post('/taxonomy/delete_taxonomy_assignment',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual("422 Object not found", response.status)
