from test.BaseCase import BaseCase


class TestGetPublicActors(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        self.db.insert({"id": 2, "name": "My Company", "type": "ACTOR"}, self.db.tables["Company"])
        self.db.insert({"id": 3, "name": "My Compan2", "type": "ACTOR"}, self.db.tables["Company"])
        self.db.insert({"id": 4, "name": "My Compan3", "type": "JOB PLATFORM"}, self.db.tables["Company"])

        response = self.application.get('/public/get_public_actors',
                                        headers=self.get_standard_header(token))

        self.assertEqual(2, len(response.json))
        self.assertEqual(200, response.status_code)
        self.assertEqual(response.json, [
            {
                'id': 2,
                'name': 'My Company',
                'is_startup': 0,
                'is_cybersecurity_core_business': 0,
                'creation_date': None
            },
            {
                'id': 3,
                'name': 'My Compan2',
                'is_startup': 0,
                'is_cybersecurity_core_business': 0,
                'creation_date': None
            }
        ])
