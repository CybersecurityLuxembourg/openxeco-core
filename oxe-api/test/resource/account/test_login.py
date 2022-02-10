from test.BaseCase import BaseCase


class TestLogin(BaseCase):

    def test_ok(self):
        payload = {
            "email": "test@openxeco.org",
            "password": "12345678",
        }

        response = self.application.post('/account/login',
                                         headers=self.get_standard_post_header(None),
                                         json=payload)

        self.assertEqual(200, response.status_code)

    def test_ko_with_wrong_password(self):
        payload = {
            "email": "test@openxeco.org",
            "password": "wrong pass",
        }

        response = self.application.post('/account/login',
                                         headers=self.get_standard_post_header(None),
                                         json=payload)

        self.assertEqual("401 Wrong email/password combination", response.status)

    def test_ko_with_inactive_account(self):
        self.db.merge({"id": 1, "is_active": False}, self.db.tables["User"])

        payload = {
            "email": "test@openxeco.org",
            "password": "12345678"
        }

        response = self.application.post('/account/login',
                                         headers=self.get_standard_post_header(None),
                                         json=payload)

        self.assertEqual("401 The account is not active. Please contact the administrator", response.status)

