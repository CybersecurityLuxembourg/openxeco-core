from test.BaseCase import BaseCase
from unittest.mock import patch


class TestGetMyUser(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        response = self.application.get('/user/get_my_user',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)

    @BaseCase.login
    @patch('db.db.DB.get')
    def test_unexisting_object(self, mock_get, token):
        mock_get.return_value = []

        response = self.application.get('/user/get_my_user',
                                        headers=self.get_standard_header(token))

        self.assertEqual("401 The user has not been found", response.status)
