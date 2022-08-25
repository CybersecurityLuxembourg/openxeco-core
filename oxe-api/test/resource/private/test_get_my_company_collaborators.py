from test.BaseCase import BaseCase


class TestGetMyEntityCollaborators(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        self.db.insert({"id": 2, "email": "myemail@test.lu", "password": ""}, self.db.tables["User"])
        self.db.insert({"id": 3, "email": "myemail@test.l2", "password": ""}, self.db.tables["User"])

        self.db.insert({"id": 1, "name": "My Entity 1"}, self.db.tables["Entity"])
        self.db.insert({"id": 2, "name": "My Entity 2"}, self.db.tables["Entity"])

        self.db.insert({"user_id": 1, "entity_id": 1}, self.db.tables["UserEntityAssignment"])
        self.db.insert({"user_id": 2, "entity_id": 1}, self.db.tables["UserEntityAssignment"])
        self.db.insert({"user_id": 3, "entity_id": 2}, self.db.tables["UserEntityAssignment"])

        response = self.application.get('/private/get_my_entity_collaborators/1',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)
        self.assertEqual(len(response.json), 2)
        self.assertEqual(response.json[0]["id"], 1)
        self.assertEqual(response.json[1]["id"], 2)
        self.assertEqual(response.json[0]["email"], "test@openxeco.org")
        self.assertEqual(response.json[1]["email"], "myemail@test.lu")

    @BaseCase.login
    def test_ko_not_assigned(self, token):
        self.db.insert({"id": 2, "email": "myemail@test.lu", "password": "MyWrongSecretSecret"}, self.db.tables["User"])

        self.db.insert({"id": 1, "name": "My Entity 1"}, self.db.tables["Entity"])

        response = self.application.get('/private/get_my_entity_collaborators/1',
                                        headers=self.get_standard_header(token))

        self.assertEqual("422 Object not found or you don't have the required access to it", response.status)
