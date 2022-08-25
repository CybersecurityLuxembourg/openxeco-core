from test.BaseCase import BaseCase


class TestGetMyNotifications(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        self.db.insert({"id": 2, "email": "myemail@test.lu", "password": "MyWrongSecretSecret"}, self.db.tables["User"])

        self.db.insert({"id": 1, "user_id": 1, "request": "My request 1"}, self.db.tables["UserRequest"])
        self.db.insert({"id": 2, "user_id": 1, "request": "My request 2"}, self.db.tables["UserRequest"])
        self.db.insert({"id": 3, "user_id": 2, "request": "My request 3"}, self.db.tables["UserRequest"])

        self.db.insert({"id": 1, "name": "My Entity"}, self.db.tables["Entity"])
        self.db.insert({"id": 2, "name": "My Entity"}, self.db.tables["Entity"])

        self.db.insert({"id": 4, "user_id": 1, "entity_id": 1, "request": ""}, self.db.tables["UserRequest"])
        self.db.insert({"id": 5, "user_id": 2, "entity_id": 1, "request": ""}, self.db.tables["UserRequest"])
        self.db.insert({"id": 6, "user_id": 1, "entity_id": 2, "request": ""}, self.db.tables["UserRequest"])
        self.db.insert({"id": 7, "user_id": 1, "entity_id": 2, "request": ""}, self.db.tables["UserRequest"])

        response = self.application.get('/private/get_my_notifications',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)
        self.assertEqual(len(response.json), 2)
        self.assertEqual(response.json["global_requests"], 2)
        self.assertEqual(response.json["entity_requests"]["1"], 1)
        self.assertEqual(response.json["entity_requests"]["2"], 2)
