from test.BaseCase import BaseCase


class TestGetRequestEnums(BaseCase):

    @BaseCase.login
    def test_ok(self, token):

        response = self.application.get('/request/get_request_enums',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)
        self.assertEqual(dict, type(response.get_json()))

