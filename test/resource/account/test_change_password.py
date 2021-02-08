from test.BaseCase import BaseCase
from unittest.mock import patch


class TestChangePassword(BaseCase):

    @BaseCase.login
    @BaseCase.grant_access("/account/change_password")
    def test_ok(self, token):
        payload = {
            "password": "12345678",
            "new_password": "MyNewPass1!"
        }

        response = self.application.post('/account/change_password',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual(200, response.status_code)

    @BaseCase.login
    @BaseCase.grant_access("/account/change_password")
    def test_password_with_wrong_format(self, token):
        payload = {
            "password": "12345678",
            "new_password": "MyNewPass"
        }

        response = self.application.post('/account/change_password',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual("422 The new password does not have the right format", response.status)

    @BaseCase.login
    @patch('db.db.DB.get')
    def test_user_not_found(self, mock_get, token):
        mock_get.return_value = []

        payload = {
            "password": "12345678",
            "new_password": "MyNewPass1!"
        }

        response = self.application.post('/account/change_password',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual("404 Requested user not found", response.status)

    @BaseCase.login
    @BaseCase.grant_access("/account/change_password")
    def test_wrong_password(self, token):
        payload = {
            "password": "wrong_password",
            "new_password": "MyNewPass1!"
        }

        response = self.application.post('/account/change_password',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual("402 The password is wrong", response.status)