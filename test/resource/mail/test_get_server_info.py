from test.BaseCase import BaseCase


class TestGetServerInfo(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        response = self.application.get('/mail/get_server_info',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)
        self.assertEqual("localhost", response.json["server"])
        self.assertEqual("1025", response.json["port"])

