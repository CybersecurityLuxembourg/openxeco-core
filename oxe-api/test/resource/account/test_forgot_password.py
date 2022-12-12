from unittest.mock import patch, ANY

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
        mock_send_mail.assert_called_once_with(ANY, subject=ANY, recipients=["test@openxeco.org"], html_body=ANY)

    @BaseCase.login
    @patch('db.db.DB.get')
    @patch('resource.account.forgot_password.send_email')
    def test_user_not_found(self, mock_send_mail, mock_get, token):
        mock_send_mail.return_value = None
        mock_get.return_value = []

        payload = {
            "email": "test@openxeco.org",
        }

        response = self.application.post('/account/forgot_password',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual(200, response.status_code)
        mock_send_mail.assert_called_once_with(ANY, subject=ANY, recipients=["trash@example.com"], html_body=ANY)

