from test.BaseCase import BaseCase


class TestDeleteMyUser(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        self.db.insert({
            "user_id": 1,
            "request": "request",
            "request_method": "POST",
            "params": "{}",
            "status_code": 200,
            "status_description": "DESC"
        }, self.db.tables["Log"])

        self.db.insert({
            "user_id": 1,
            "status": "NEW",
            "request": "r",
        }, self.db.tables["UserRequest"])

        response = self.application.post('/private/delete_my_user',
                                         headers=self.get_standard_post_header(token))

        self.assertEqual(200, response.status_code)
        self.assertEqual(0, self.db.get_count(self.db.tables["UserRequest"]))
        self.assertEqual(0, self.db.get_count(self.db.tables["User"]))
        self.assertEqual(3, self.db.get_count(self.db.tables["Log"]))
