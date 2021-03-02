from test.BaseCase import BaseCase


class TestGetResources(BaseCase):

    @BaseCase.login
    def test_ok(self, token):

        response = self.application.get('/resource/get_resources',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)
