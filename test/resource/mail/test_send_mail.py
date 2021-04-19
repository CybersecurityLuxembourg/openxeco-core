from test.BaseCase import BaseCase
from unittest.mock import patch


class TestSendMail(BaseCase):

    @BaseCase.login
    @BaseCase.grant_access("/mail/send_mail")
    @patch('resource.mail.send_mail.send_email')
    def test_ok(self, mock_send_mail, token):
        mock_send_mail.return_value = None

        payload = {
            "subject": "TEST",
            "address": "test@cy.lu",
            "content": "Mail content",
        }

        response = self.application.post('/mail/send_mail',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual(200, response.status_code)

    @BaseCase.login
    @BaseCase.grant_access("/mail/send_mail")
    @patch('resource.mail.send_mail.send_email')
    def test_ok_with_user_as_cc(self, mock_send_mail, token):
        mock_send_mail.return_value = None

        payload = {
            "subject": "TEST",
            "address": "test@cybersecurity.lu",
            "content": "Mail content",
            "user_as_cc": True
        }

        response = self.application.post('/mail/send_mail',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual(200, response.status_code)

    @BaseCase.login
    @BaseCase.grant_access("/mail/send_mail")
    def test_ko_user_with_bad_formatted_mail(self, token):
        users = self.db.get(self.db.tables["User"])
        users[0].email = "bad@emailformat"
        self.db.merge(users[0], self.db.tables["User"])

        payload = {
            "subject": "TEST",
            "address": "test@cybersecurity.lu",
            "content": "Mail content",
            "user_as_cc": True
        }

        response = self.application.post('/mail/send_mail',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual("500 The user does not have a correct email address", response.status)
