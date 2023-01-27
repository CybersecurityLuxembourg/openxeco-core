from test.BaseCase import BaseCase


class TestRefresh(BaseCase):

    def test_ok(self):
        payload = {
            "email": "test@openxeco.org",
            "password": "12345678"
        }

        r = self.application.post('/account/login',
                                         headers=self.get_standard_post_header(None),
                                         json=payload)

        cookie_content = [c for c in r.headers.getlist("Set-Cookie") if c.startswith("refresh_token_cookie")][0]
        refresh_token = cookie_content.split(";")[0].split("=")[1]

        payload = {
            "refresh_token": refresh_token,
        }

        response = self.application.post('/account/refresh',
                                         headers=self.get_standard_post_header(refresh_token),
                                         json=payload)

        self.assertEqual(200, response.status_code)
