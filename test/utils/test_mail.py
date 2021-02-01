from test.BaseCase import BaseCase
from utils.mail import send_email
from unittest.mock import patch


class Mail:
    def send(self, message):
        pass


class TestMail(BaseCase):

    def test_ok(self):
        send_email(Mail(), "subject", "recipient", "html_body")

    @patch("test.utils.test_mail.Mail.send")
    def test_force_connection_error(self, mock_send):
        mock_send.side_effect = ConnectionRefusedError("")

        self.assertRaises(Exception,
                          send_email,
                          Mail(), "subject", "sender", "recipient", "html_body")
