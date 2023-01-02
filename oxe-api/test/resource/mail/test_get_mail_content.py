from unittest.mock import patch, mock_open

from test.BaseCase import BaseCase


class TestGetMailContent(BaseCase):

    @BaseCase.login
    @patch("builtins.open", mock_open(read_data="data"))
    def test_ok(self, token):
        response = self.application.get('/mail/get_mail_content/account_creation',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)

    @BaseCase.login
    def test_wrong_template_name(self, token):
        response = self.application.get('/mail/get_mail_content/wrong_name',
                                        headers=self.get_standard_header(token))

        self.assertEqual("404 This mail template does not exist", response.status)
