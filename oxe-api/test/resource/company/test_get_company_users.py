from test.BaseCase import BaseCase


class TestGetEntityUsers(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        self.db.insert({"id": 2, "email": "myemail@test.lu", "password": ""}, self.db.tables["User"])
        self.db.insert({"id": 3, "email": "myemail@test.l2", "password": ""}, self.db.tables["User"])

        self.db.insert({"id": 1, "name": "My Entity 1"}, self.db.tables["Entity"])
        self.db.insert({"id": 2, "name": "My Entity 2"}, self.db.tables["Entity"])

        self.db.insert({"user_id": 2, "entity_id": 1}, self.db.tables["UserEntityAssignment"])
        self.db.insert({"user_id": 3, "entity_id": 2}, self.db.tables["UserEntityAssignment"])

        response = self.application.get('/entity/get_entity_users/1',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)
        self.assertEqual(response.json, [{'id': 2, 'email': 'myemail@test.lu', 'first_name': None, 'last_name': None}])

    @BaseCase.login
    def test_ok_not_assigned(self, token):
        self.db.insert({"id": 2, "email": "myemail@test.lu", "password": "MyWrongSecretSecret"}, self.db.tables["User"])

        response = self.application.get('/entity/get_entity_users/1',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)
        self.assertEqual(response.json, [])
