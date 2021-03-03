from test.BaseCase import BaseCase


class TestGetMyRequests(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        self.db.insert({"id": 2, "email": "myemail@test.lu", "password": "MyWrongSecretSecret"}, self.db.tables["User"])

        self.db.insert({"id": 1, "user_id": 1, "request": "My request 1"}, self.db.tables["UserRequest"])
        self.db.insert({"id": 2, "user_id": 1, "request": "My request 2"}, self.db.tables["UserRequest"])
        self.db.insert({"id": 3, "user_id": 2, "request": "My request 3"}, self.db.tables["UserRequest"])

        response = self.application.get('/privatespace/get_my_requests',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)
        self.assertEqual(len(response.json), 2)
        self.assertEqual(response.json[0]["id"], 1)
        self.assertEqual(response.json[1]["id"], 2)
