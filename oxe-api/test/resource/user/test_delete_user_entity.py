from test.BaseCase import BaseCase


class TestDeleteUserEntity(BaseCase):

    @BaseCase.login
    @BaseCase.grant_access("/user/delete_user_entity")
    def test_ok(self, token):
        self.db.insert({"id": 2, "email": "myemail@test.lu", "password": "MyWrongSecretSecret"}, self.db.tables["User"])
        self.db.insert({"id": 14, "name": "My entity"}, self.db.tables["Entity"])
        self.db.insert({"id": 15, "name": "My entity2"}, self.db.tables["Entity"])
        self.db.insert({"id": 16, "name": "Entity3"}, self.db.tables["Entity"])
        self.db.insert({"user_id": 2, "entity_id": 14}, self.db.tables["UserEntityAssignment"])
        self.db.insert({"user_id": 2, "entity_id": 15}, self.db.tables["UserEntityAssignment"])

        payload = {
            "user": 2,
            "entity": 14,
        }

        response = self.application.post('/user/delete_user_entity',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual(200, response.status_code)
        self.assertEqual(self.db.get_count(self.db.tables["UserEntityAssignment"]), 1)

    @BaseCase.login
    @BaseCase.grant_access("/user/delete_user_entity")
    def test_delete_unexisting(self, token):
        payload = {
            "user": 2,
            "entity": 14,
        }

        response = self.application.post('/user/delete_user_entity',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual("422 Object not found", response.status)
