from test.BaseCase import BaseCase


class TestGetPublicCompanies(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        self.db.insert({"id": 2, "name": "My Company", "type": "ACTOR"}, self.db.tables["Company"])
        self.db.insert({"id": 3, "name": "My Compan2", "type": "ACTOR"}, self.db.tables["Company"])
        self.db.insert({"id": 4, "name": "My Compan3", "type": "JOB PLATFORM"}, self.db.tables["Company"])

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
                'type': 'ACTOR'
            },
            {
                'id': 3,
                'image': None,
                'name': 'My Compan2',
                'is_startup': 0,
                'is_cybersecurity_core_business': 0,
                'creation_date': None,
                'type': 'ACTOR'
            },
            {
                'id': 4,
                'image': None,
                'name': 'My Compan3',
                'is_startup': 0,
                'is_cybersecurity_core_business': 0,
                'creation_date': None,
                'type': 'JOB PLATFORM'
            }
        ])

    @BaseCase.login
    def test_ok_with_type(self, token):
        self.db.insert({"id": 2, "name": "My Company", "type": "ACTOR"}, self.db.tables["Company"])
        self.db.insert({"id": 3, "name": "My Compan2", "type": "ACTOR"}, self.db.tables["Company"])
        self.db.insert({"id": 4, "name": "My Compan3", "type": "JOB PLATFORM"}, self.db.tables["Company"])

        response = self.application.get('/public/get_public_companies?type=ACTOR',
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
                'type': 'ACTOR'
            },
            {
                'id': 3,
                'image': None,
                'name': 'My Compan2',
                'is_startup': 0,
                'is_cybersecurity_core_business': 0,
                'creation_date': None,
                'type': 'ACTOR'
            }
        ])
