from test.BaseCase import BaseCase


class TestGetUsers(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        self.db.insert({"email": "email1", "password": "pass1"}, self.db.tables["User"])
        self.db.insert({"email": "email2", "password": "pass2"}, self.db.tables["User"])

        response = self.application.get('/user/get_users',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)
        # 3 because there is the User need to authenticate
        self.assertEqual(3, len(response.json))
