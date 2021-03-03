from test.BaseCase import BaseCase


class TestGetUser(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        self.db.insert({"id": 2, "email": "myemail@email.lu", "password": "My password"}, self.db.tables["User"])

        response = self.application.get('/user/get_user/2',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)

    @BaseCase.login
    def test_unexisting_id(self, token):
        response = self.application.get('/user/get_user/4',
                                        headers=self.get_standard_header(token))

        self.assertEqual("500 Object not found", response.status)
