from test.BaseCase import BaseCase


class TestExtractEntities(BaseCase):

    @BaseCase.login
    def test_ok_basic(self, token):
        self.db.insert({"id": 2, "name": "My Entity"}, self.db.tables["Entity"])
        self.db.insert({"id": 3, "name": "My Entity 2"}, self.db.tables["Entity"])

        response = self.application.get('/entity/extract_entities?format=json',
                                        headers=self.get_standard_header(token))

        self.assertEqual(2, len(response.json))
        self.assertEqual(200, response.status_code)
        self.assertTrue("Address|country" not in response.json[1])
        self.assertTrue("Workforce|workforce" not in response.json[1])
        self.assertTrue("Taxonomy|ROLE" not in response.json[1])

    @BaseCase.login
    def test_ok_with_filter(self, token):
        self.db.insert({"id": 2, "name": "My Entity"}, self.db.tables["Entity"])
        self.db.insert({"id": 3, "name": "My Entity 2"}, self.db.tables["Entity"])

        response = self.application.get('/entity/extract_entities?format=json&name=Entity 2&include_address=true',
                                        headers=self.get_standard_header(token))

        self.assertEqual(1, len(response.json))
        self.assertEqual(200, response.status_code)
        self.assertTrue("Address|country" not in response.json[0])
        self.assertTrue("Workforce|workforce" not in response.json[0])
        self.assertTrue("Taxonomy|ROLE" not in response.json[0])

    @BaseCase.login
    def test_ok_with_users(self, token):
        self.db.insert({"id": 2, "name": "My Entity"}, self.db.tables["Entity"])
        self.db.insert({"id": 3, "name": "My Entity 2"}, self.db.tables["Entity"])
        self.db.insert({"id": 2, "email": "myemail@test.lu", "password": "MyWrongSecretSecret"}, self.db.tables["User"])
        self.db.insert({"id": 3, "email": "myemai2@test.lu", "password": "MyWrongSecretSecret"}, self.db.tables["User"])
        self.db.insert({"user_id": 2, "entity_id": 2}, self.db.tables["UserEntityAssignment"])
        self.db.insert({"user_id": 3, "entity_id": 2}, self.db.tables["UserEntityAssignment"])

        response = self.application.get('/entity/extract_entities?format=json&include_user=true',
                                        headers=self.get_standard_header(token))

        self.assertEqual(3, len(response.json))
        self.assertEqual(200, response.status_code)
        self.assertEqual(response.json[0]["Global|name"], "My Entity")
        self.assertEqual(response.json[0]["User|email"], "myemail@test.lu")
        self.assertEqual(response.json[1]["Global|name"], "My Entity")
        self.assertEqual(response.json[1]["User|email"], "myemai2@test.lu")
        self.assertEqual(response.json[2]["Global|name"], "My Entity 2")
        self.assertEqual(response.json[2]["User|email"], None)

    @BaseCase.login
    def test_ok_with_address(self, token):
        self.db.insert({"id": 2, "name": "My Entity"}, self.db.tables["Entity"])
        self.db.insert({"id": 3, "name": "My Entity 2"}, self.db.tables["Entity"])
        self.db.insert({
            "id": 1,
            "entity_id": 2,
            "address_1": "Rue inconnue",
            "address_2": None,
            "number": None,
            "postal_code": "1515",
            "city": "Luxembourg",
            "administrative_area": None,
            "country": "Luxembourg",
            "latitude": None,
            "longitude": None,
        }, self.db.tables["EntityAddress"])

        response = self.application.get('/entity/extract_entities?format=json&include_address=true',
                                        headers=self.get_standard_header(token))

        self.assertEqual(2, len(response.json))
        self.assertEqual(200, response.status_code)
        self.assertEqual(response.json[0]["Address|country"], "Luxembourg")
        self.assertEqual(response.json[1]["Address|country"], None)
        self.assertTrue("Workforce|workforce" not in response.json[1])
        self.assertTrue("Taxonomy|ROLE" not in response.json[1])

    @BaseCase.login
    def test_ok_with_workforce(self, token):
        self.db.insert({"id": 2, "name": "My Entity"}, self.db.tables["Entity"])
        self.db.insert({"id": 3, "name": "My Entity 2"}, self.db.tables["Entity"])

        self.db.insert({
            "id": 1,
            "entity_id": 2,
            "workforce": 15,
            "date": "2020-01-01",
            "is_estimated": True,
            "source": "Newspaper",
        }, self.db.tables["Workforce"])
        self.db.insert({
            "id": 2,
            "entity_id": 2,
            "workforce": 20,
            "date": "2020-01-05",
            "is_estimated": True,
            "source": "Newspaper",
        }, self.db.tables["Workforce"])
        self.db.insert({
            "id": 3,
            "entity_id": 2,
            "workforce": 25,
            "date": "2018-01-05",
            "is_estimated": True,
            "source": "Newspaper",
        }, self.db.tables["Workforce"])

        response = self.application.get('/entity/extract_entities?format=json&include_workforce=true',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)
        self.assertEqual(2, len(response.json))
        self.assertEqual(response.json[0]["Workforce|workforce"], 20)
        self.assertEqual(response.json[1]["Workforce|workforce"], None)
        self.assertTrue("Address|country" not in response.json[1])
        self.assertTrue("Taxonomy|ROLE" not in response.json[1])

    @BaseCase.login
    def test_ok_with_taxonomy(self, token):
        self.db.insert({"id": 2, "name": "My Entity"}, self.db.tables["Entity"])
        self.db.insert({"id": 3, "name": "My Entity 2"}, self.db.tables["Entity"])
        self.db.insert({"name": "CAT1"}, self.db.tables["TaxonomyCategory"])
        self.db.insert({"id": 1, "name": "My Value", "category": "CAT1"}, self.db.tables["TaxonomyValue"])
        self.db.insert({"entity_id": 2, "taxonomy_value_id": 1}, self.db.tables["TaxonomyAssignment"])

        response = self.application.get('/entity/extract_entities?format=json&include_taxonomy=true',
                                        headers=self.get_standard_header(token))

        self.assertEqual(2, len(response.json))
        self.assertEqual(200, response.status_code)
        self.assertTrue("Address|country" not in response.json[1])
        self.assertTrue("Workforce|workforce" not in response.json[1])

    @BaseCase.login
    def test_ok_with_taxonomy_and_hierarchy(self, token):
        self.db.insert({"id": 2, "name": "My Entity"}, self.db.tables["Entity"])
        self.db.insert({"id": 3, "name": "My Entity 2"}, self.db.tables["Entity"])

        self.db.insert({"name": "CAT1"}, self.db.tables["TaxonomyCategory"])
        self.db.insert({"name": "CAT2"}, self.db.tables["TaxonomyCategory"])
        self.db.insert({"parent_category": "CAT1", "child_category": "CAT2"},
                       self.db.tables["TaxonomyCategoryHierarchy"])

        self.db.insert({"id": 1, "name": "My Value", "category": "CAT1"}, self.db.tables["TaxonomyValue"])
        self.db.insert({"id": 2, "name": "My Value 2", "category": "CAT1"}, self.db.tables["TaxonomyValue"])
        self.db.insert({"id": 3, "name": "My Value 3", "category": "CAT2"}, self.db.tables["TaxonomyValue"])
        self.db.insert({"parent_value": 1, "child_value": 3}, self.db.tables["TaxonomyValueHierarchy"])

        self.db.insert({"entity_id": 2, "taxonomy_value_id": 3}, self.db.tables["TaxonomyAssignment"])

        response = self.application.get('/entity/extract_entities?format=json&include_taxonomy=true',
                                        headers=self.get_standard_header(token))

        self.assertEqual(2, len(response.json))
        self.assertEqual(200, response.status_code)
        self.assertTrue("Address|country" not in response.json[0])
        self.assertTrue("Workforce|workforce" not in response.json[0])
        self.assertTrue("Taxonomy|CAT1" in response.json[0])
        self.assertTrue("Taxonomy|CAT2" in response.json[0])
        self.assertEqual(response.json[0]["Taxonomy|CAT1"], "My Value")
        self.assertEqual(response.json[0]["Taxonomy|CAT2"], "My Value 3")

    @BaseCase.login
    def test_ok_xlsx(self, token):
        self.db.insert({"id": 2, "name": "My Entity"}, self.db.tables["Entity"])
        self.db.insert({"id": 3, "name": "My Entity 2"}, self.db.tables["Entity"])

        response = self.application.get('/entity/extract_entities',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)
        self.assertEqual("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", response.mimetype)
