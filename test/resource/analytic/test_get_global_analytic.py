from test.BaseCase import BaseCase


class TestGetGlobalAnalytics(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        self.db.insert({
            "id": 1,
            "name": "My company",
            "creation_date": "2020-06-06",
        }, self.db.tables["Company"])
        self.db.insert({
            "id": 2,
            "name": "My company 2",
            "creation_date": None,
        }, self.db.tables["Company"])
        self.db.insert({
            "id": 3,
            "name": "My company 3",
            "creation_date": None,
        }, self.db.tables["Company"])

        self.db.insert({"name": "ECOSYSTEM ROLE"}, self.db.tables["TaxonomyCategory"])
        self.db.insert({"id": 1, "name": "ACTOR", "category": "ECOSYSTEM ROLE"}, self.db.tables["TaxonomyValue"])
        self.db.insert({"company": 2, "taxonomy_value": 1}, self.db.tables["TaxonomyAssignment"])
        self.db.insert({"company": 3, "taxonomy_value": 1}, self.db.tables["TaxonomyAssignment"])

        response = self.application.get('/analytic/get_global_analytics',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)
        self.assertEqual(2, len(response.json["actors"]))
