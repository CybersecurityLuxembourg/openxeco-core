from test.BaseCase import BaseCase


class TestIsLogged(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        response = self.application.get('/private/is_logged',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)

    def test_ko(self):
        response = self.application.get('/private/is_logged',
                                        headers=self.get_standard_header(None))

        self.assertEqual(422, response.status_code)
