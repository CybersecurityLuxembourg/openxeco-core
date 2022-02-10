from unittest.mock import patch

from test.BaseCase import BaseCase


class TestForgotPassword(BaseCase):

    @BaseCase.login
    @patch('resource.account.forgot_password.send_email')
    def test_ok(self, mock_send_mail, token):
        mock_send_mail.return_value = None

        payload = {
            "email": "test@openxeco.org",
        }

        response = self.application.post('/account/forgot_password',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual(200, response.status_code)

    @BaseCase.login
    @patch('db.db.DB.get')
    def test_user_not_found(self, mock_get, token):
        mock_get.return_value = []

        payload = {
            "email": "test@openxeco.org",
        }

        response = self.application.post('/account/forgot_password',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual("500 The user has not been found", response.status)
