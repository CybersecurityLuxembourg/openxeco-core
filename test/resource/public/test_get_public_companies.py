from test.BaseCase import BaseCase


class TestGetPublicCompanies(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        self.db.insert({"id": 2, "name": "My Company"}, self.db.tables["Company"])
        self.db.insert({"id": 3, "name": "My Company 2"}, self.db.tables["Company"])
        self.db.insert({"id": 4, "name": "My Company 3"}, self.db.tables["Company"])

        response = self.application.get('/public/get_public_companies',
                                        headers=self.get_standard_header(token))

        self.assertEqual(3, len(response.json))
        self.assertEqual(200, response.status_code)
        self.assertEqual(response.json, [
            {
                'id': 2,
                'image': None,
                'name': 'My Company',
                'is_startup': 0,
                'is_cybersecurity_core_business': 0,
                'creation_date': None,
            },
            {
                'id': 3,
                'image': None,
                'name': 'My Company 2',
                'is_startup': 0,
                'is_cybersecurity_core_business': 0,
                'creation_date': None,
            },
            {
                'id': 4,
                'image': None,
                'name': 'My Company 3',
                'is_startup': 0,
                'is_cybersecurity_core_business': 0,
                'creation_date': None,
            }
        ])

    @BaseCase.login
    def test_ok_with_type(self, token):
        self.db.insert({"id": 2, "name": "My Company"}, self.db.tables["Company"])
        self.db.insert({"id": 3, "name": "My Company 2"}, self.db.tables["Company"])
        self.db.insert({"id": 4, "name": "My Company 3"}, self.db.tables["Company"])

        self.db.insert({"name": "ECOSYSTEM ROLE"}, self.db.tables["TaxonomyCategory"])
        self.db.insert({"id": 1, "name": "ACTOR", "category": "ECOSYSTEM ROLE"}, self.db.tables["TaxonomyValue"])
        self.db.insert({"company": 2, "taxonomy_value": 1}, self.db.tables["TaxonomyAssignment"])
        self.db.insert({"company": 3, "taxonomy_value": 1}, self.db.tables["TaxonomyAssignment"])

        response = self.application.get('/public/get_public_companies?ecosystem_role=ACTOR',
                                        headers=self.get_standard_header(token))

        self.assertEqual(2, len(response.json))
        self.assertEqual(200, response.status_code)
        self.assertEqual(response.json, [
            {
                'id': 2,
                'image': None,
                'name': 'My Company',
                'is_startup': 0,
                'is_cybersecurity_core_business': 0,
                'creation_date': None,
            },
            {
                'id': 3,
                'image': None,
                'name': 'My Company 2',
                'is_startup': 0,
                'is_cybersecurity_core_business': 0,
                'creation_date': None,
            }
        ])
