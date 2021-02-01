from test.BaseCase import BaseCase
from unittest.mock import patch, Mock


class TestGetCompany(BaseCase):

    @BaseCase.login
    def test_ok(self, token):

        response = self.application.get('/company/get_company_enums',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)
        self.assertEqual(dict, type(response.get_json()))

