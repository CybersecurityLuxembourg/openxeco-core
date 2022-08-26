from test.BaseCase import BaseCase


class TestGetMyEntityTaxonomy(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        self.db.insert({"id": 2, "email": "myemail@test.lu", "password": "MyWrongSecretSecret"}, self.db.tables["User"])

        self.db.insert({"id": 1, "name": "My Entity 1"}, self.db.tables["Entity"])
        self.db.insert({"id": 2, "name": "My Entity 1"}, self.db.tables["Entity"])

        self.db.insert({"user_id": 1, "entity_id": 1}, self.db.tables["UserEntityAssignment"])
        self.db.insert({"user_id": 2, "entity_id": 1}, self.db.tables["UserEntityAssignment"])
        self.db.insert({"user_id": 1, "entity_id": 2}, self.db.tables["UserEntityAssignment"])

        self.db.insert({"name": "CAT1"}, self.db.tables["TaxonomyCategory"])
        self.db.insert({"id": 1, "name": "My Value", "category": "CAT1"}, self.db.tables["TaxonomyValue"])
        self.db.insert({"id": 2, "name": "My Value2", "category": "CAT1"}, self.db.tables["TaxonomyValue"])
        self.db.insert({"entity_id": 1, "taxonomy_value_id": 1}, self.db.tables["TaxonomyAssignment"])
        self.db.insert({"entity_id": 2, "taxonomy_value_id": 2}, self.db.tables["TaxonomyAssignment"])

        response = self.application.get('/private/get_my_entity_taxonomy/1',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)
        self.assertEqual(len(response.json), 1)
        self.assertEqual(response.json[0]["entity_id"], 1)
        self.assertEqual(response.json[0]["taxonomy_value_id"], 1)

    @BaseCase.login
    def test_ko_not_assigned(self, token):

        self.db.insert({"id": 1, "name": "My Entity 1"}, self.db.tables["Entity"])

        response = self.application.get('/private/get_my_entity_taxonomy/1',
                                        headers=self.get_standard_header(token))

        self.assertEqual("422 Object not found or you don't have the required access to it", response.status)
