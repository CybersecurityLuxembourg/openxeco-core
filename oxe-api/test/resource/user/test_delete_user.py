from test.BaseCase import BaseCase


class TestDeleteUser(BaseCase):

    @BaseCase.login
    @BaseCase.grant_access("/user/delete_user")
    def test_ok(self, token):
        self.db.insert({"id": 2, "email": "myemail@test.lu", "password": "MyWrongSecretSecret"}, self.db.tables["User"])

        payload = {"id": 2}

        response = self.application.post('/user/delete_user',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual(200, response.status_code)

    @BaseCase.login
    @BaseCase.grant_access("/user/delete_user")
    def test_delete_unexisting(self, token):
        payload = {"id": 2}

        response = self.application.post('/user/delete_user',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual("422 Object not found", response.status)
