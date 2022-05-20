from test.BaseCase import BaseCase


class TestGetPublicCompanyEnums(BaseCase):

    @BaseCase.login
    def test_ok(self, token):

        response = self.application.get('/public/get_public_company_enums',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)
        self.assertEqual(dict, type(response.get_json()))

