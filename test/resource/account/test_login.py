from test.BaseCase import BaseCase


class TestLogin(BaseCase):

    def test_ok(self):
        payload = {
            "email": "test@cybersecurity.lu",
            "password": "12345678"
        }

        response = self.application.post('/account/login',
                                         headers=self.get_standard_post_header(None),
                                         json=payload)

        self.assertEqual(200, response.status_code)

    def test_password_with_wrong_format(self):
        payload = {
            "email": "test@cybersecurity.lu",
            "password": "wrong pass"
        }

        response = self.application.post('/account/login',
                                         headers=self.get_standard_post_header(None),
                                         json=payload)

        self.assertEqual("401 Wrong email/password combination", response.status)
