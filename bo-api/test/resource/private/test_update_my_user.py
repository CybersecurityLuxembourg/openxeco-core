from test.BaseCase import BaseCase


class TestUpdateMyUser(BaseCase):

    @BaseCase.login
    def test_ok(self, token):

        payload = {"first_name": "test"}

        response = self.application.post('/private/update_my_user',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        user = self.db.get(self.db.tables["User"], {"id": 1})

        self.assertEqual(200, response.status_code)
        self.assertEqual(len(user), 1)
        self.assertEqual(user[0].first_name, "test")

    @BaseCase.login
    def test_ko_with_password(self, token):

        payload = {"password": "test"}

        response = self.application.post('/private/update_my_user',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual("422 UNPROCESSABLE ENTITY", response.status)

    @BaseCase.login
    def test_ko_with_email(self, token):
        payload = {"email": "test"}

        response = self.application.post('/private/update_my_user',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual("422 UNPROCESSABLE ENTITY", response.status)

    @BaseCase.login
    def test_ko_with_is_admin(self, token):

        payload = {"is_admin": "test"}

        response = self.application.post('/private/update_my_user',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual("422 UNPROCESSABLE ENTITY", response.status)

    @BaseCase.login
    def test_ko_with_is_active(self, token):

        payload = {"is_active": "test"}

        response = self.application.post('/private/update_my_user',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual("422 UNPROCESSABLE ENTITY", response.status)
