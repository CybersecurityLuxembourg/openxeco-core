from test.BaseCase import BaseCase
from unittest.mock import patch


class TestCreateAccount(BaseCase):

    @patch('resource.account.create_account.send_email')
    def test_ok(self, mock_send_mail):
        mock_send_mail.return_value = None

        payload = {
            "email": "test@domain.com",
        }

        response = self.application.post('/account/create_account',
                                         headers=self.get_standard_post_header(None),
                                         json=payload)

        users = self.db.get(self.db.tables["User"])

        self.assertEqual(200, response.status_code)
        self.assertEqual(len(users), 2)

    def test_ko_wrong_email_format(self):
        payload = {
            "email": "wrong_format",
        }

        response = self.application.post('/account/create_account',
                                         headers=self.get_standard_post_header(None),
                                         json=payload)

        self.assertEqual("422 The provided email does not have the right format", response.status)

    def test_ko_already_exists(self):
        self.db.insert({"id": 2, "email": "myemail@test.lu", "password": "MySecretPass"}, self.db.tables["User"])

        payload = {
            "email": "myemail@test.lu",
        }

        response = self.application.post('/account/create_account',
                                         headers=self.get_standard_post_header(None),
                                         json=payload)

        self.assertEqual("403 An account already exists with this email address", response.status)
