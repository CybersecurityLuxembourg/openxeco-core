from test.BaseCase import BaseCase


class TestGetNewRequestCount(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        self.db.insert({"id": 2, "user_id": 1, "request": "My request"}, self.db.tables["UserRequest"])
        self.db.insert({"id": 3, "user_id": 1, "request": "My request"}, self.db.tables["UserRequest"])

        response = self.application.get('/request/get_new_request_count',
                                        headers=self.get_standard_header(token))

        self.assertEqual(2, response.json)
        self.assertEqual(200, response.status_code)
