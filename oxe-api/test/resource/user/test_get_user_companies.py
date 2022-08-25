from test.BaseCase import BaseCase


class TestGetUserEntities(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        self.db.insert({"id": 2, "email": "myemail@email.lu", "password": "My password"}, self.db.tables["User"])
        self.db.insert({"id": 14, "name": "My entity"}, self.db.tables["Entity"])
        self.db.insert({"id": 15, "name": "My entity2"}, self.db.tables["Entity"])
        self.db.insert({"id": 16, "name": "Entity3"}, self.db.tables["Entity"])
        self.db.insert({"user_id": 2, "entity_id": 14}, self.db.tables["UserEntityAssignment"])
        self.db.insert({"user_id": 2, "entity_id": 15}, self.db.tables["UserEntityAssignment"])

        response = self.application.get('/user/get_user_entities/2',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)
        self.assertEqual([
            {'entity_id': 14, 'department': None, 'user_id': 2},
            {'entity_id': 15, 'department': None, 'user_id': 2}
        ], response.json)
