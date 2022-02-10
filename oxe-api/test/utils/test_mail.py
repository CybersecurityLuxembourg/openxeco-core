from unittest.mock import patch

from test.BaseCase import BaseCase
from utils.mail import send_email


class Mail:
    def send(self, message):
        raise Exception("")


class TestMail(BaseCase):

    def test_ok(self):
        send_email(Mail(), "subject", "recipient", "html_body")

    def test_force_connection_error(self):
        self.assertRaises(Exception,
                          send_email,
                          Mail(), "subject", "sender", "recipient", "html_body")
