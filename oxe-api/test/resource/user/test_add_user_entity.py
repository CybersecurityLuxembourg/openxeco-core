from test.BaseCase import BaseCase


class TestAddUserEntity(BaseCase):

    @BaseCase.login
    @BaseCase.grant_access("/user/add_user_entity")
    def test_ok(self, token):
        self.db.insert({"id": 2, "email": "myemail@test.lu", "password": "MySecretSecret"}, self.db.tables["User"])
        self.db.insert({"id": 14, "name": "My entity"}, self.db.tables["Entity"])

        payload = {
            "user_id": 2,
            "entity_id": 14,
        }

        response = self.application.post('/user/add_user_entity',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        assignments = self.db.get(self.db.tables["UserEntityAssignment"])

        self.assertEqual(200, response.status_code)
        self.assertEqual(len(assignments), 1)

    @BaseCase.login
    @BaseCase.grant_access("/user/add_user_entity")
    def test_ok_with_department(self, token):
        self.db.insert({"id": 2, "email": "myemail@test.lu", "password": "MySecretSecret"}, self.db.tables["User"])
        self.db.insert({"id": 14, "name": "My entity"}, self.db.tables["Entity"])

        payload = {
            "user_id": 2,
            "entity_id": 14,
            "department": "OTHER",
        }

        response = self.application.post('/user/add_user_entity',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        assignments = self.db.get(self.db.tables["UserEntityAssignment"])

        self.assertEqual(200, response.status_code)
        self.assertEqual(len(assignments), 1)

    @BaseCase.login
    @BaseCase.grant_access("/user/add_user_entity")
    def test_already_exist(self, token):
        self.db.insert({"id": 2, "email": "myemail@test.lu", "password": "MySecretSecret"}, self.db.tables["User"])
        self.db.insert({"id": 14, "name": "My entity"}, self.db.tables["Entity"])
        self.db.insert({"user_id": 2, "entity_id": 14}, self.db.tables["UserEntityAssignment"])

        payload = {
            "user_id": 2,
            "entity_id": 14,
        }

        response = self.application.post('/user/add_user_entity',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        assignments = self.db.get(self.db.tables["UserEntityAssignment"])

        self.assertEqual("422 Object already existing", response.status)
        self.assertEqual(len(assignments), 1)
