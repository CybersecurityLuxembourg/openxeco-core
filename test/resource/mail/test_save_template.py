from test.BaseCase import BaseCase
from unittest.mock import patch, mock_open


class TestSaveTemplate(BaseCase):

    @BaseCase.login
    @BaseCase.grant_access("/mail/save_template")
    @patch("builtins.open", mock_open(read_data="data"))
    def test_ok(self, token):

        payload = {
            "name": "new_account",
            "content": "<h1>data</h1>"
        }

        response = self.application.post('/mail/save_template',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual(200, response.status_code)

    @BaseCase.login
    @BaseCase.grant_access("/mail/save_template")
    @patch("builtins.open", mock_open(read_data="data"))
    def test_unknown_template(self, token):

        payload = {
            "name": "unknown_template",
            "content": "<h1>data</h1>"
        }

        response = self.application.post('/mail/save_template',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual("404 This mail template does not exist", response.status)
