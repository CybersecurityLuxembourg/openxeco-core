from test.BaseCase import BaseCase


class TestGetPublicEntityEnums(BaseCase):

    @BaseCase.login
    def test_ok(self, token):

        response = self.application.get('/public/get_public_entity_enums',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)
        self.assertEqual(dict, type(response.get_json()))

