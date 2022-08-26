from test.BaseCase import BaseCase


class TestGetUserEntityAssignments(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        self.db.insert({"id": 14, "email": "myemail@test.lu", "password": "MyWrongSecret"}, self.db.tables["User"])
        self.db.insert({"id": 2, "name": "My Entity"}, self.db.tables["Entity"])
        self.db.insert({"user_id": 14, "entity_id": 2, "department": "TOP MANAGEMENT"},
                       self.db.tables["UserEntityAssignment"])

        response = self.application.get('/user/get_user_entity_assignments',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)
        self.assertEqual([{'user_id': 14, 'entity_id': 2, 'department': "TOP MANAGEMENT"}], response.json)
