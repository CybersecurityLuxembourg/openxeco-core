from unittest.mock import patch

from test.BaseCase import BaseCase


class TestSendCommunication(BaseCase):

    @BaseCase.login
    @BaseCase.grant_access("/communication/send_communication")
    @patch('resource.mail.send_mail.send_email')
    def test_ok(self, mock_send_mail, token):
        mock_send_mail.return_value = None

        payload = {
            "subject": "TEST",
            "addresses": ["test@cy.lu", "test2@cy.lu"],
            "body": "Mail content",
        }

        response = self.application.post('/communication/send_communication',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        communications = self.db.get(self.db.tables["Communication"])

        self.assertEqual(200, response.status_code)
        self.assertEqual(len(communications), 1)
