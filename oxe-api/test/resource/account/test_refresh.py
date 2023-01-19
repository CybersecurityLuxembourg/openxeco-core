from test.BaseCase import BaseCase


class TestRefresh(BaseCase):

    def test_ok(self):
        payload = {
            "email": "test@openxeco.org",
            "password": "12345678"
        }

        response = self.application.post('/account/login',
                                         headers=self.get_standard_post_header(None),
                                         json=payload)

        tokens = response.json

        payload = {
            "refresh_token": tokens["refresh_token"],
        }

        response = self.application.post('/account/refresh',
                                         headers=self.get_standard_post_header(tokens["refresh_token"]),
                                         json=payload)

        self.assertEqual(200, response.status_code)
