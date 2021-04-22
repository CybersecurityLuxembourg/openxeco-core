from test.BaseCase import BaseCase
from utils.password import generate_password


class TestGetUser(BaseCase):

    def test_has_mail_format(self):
        try:
            generate_password()
        except Exception:
            self.fail("myFunc() raised ExceptionType unexpectedly!")
