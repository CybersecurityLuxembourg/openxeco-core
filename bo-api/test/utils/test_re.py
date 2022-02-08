from test.BaseCase import BaseCase
from utils.re import has_password_format, has_mail_format, has_date_format


class TestGetUser(BaseCase):

    def test_has_mail_format(self):
        self.assertTrue(has_mail_format("mymail@cs.lu"))
        self.assertTrue(has_mail_format("My.mail-add@c.cz"))
        self.assertTrue(has_mail_format("My.mail_add@c-8_a.cz"))
        self.assertFalse(has_mail_format("@mail.lu"))
        self.assertFalse(has_mail_format("mymail@domain"))
        self.assertFalse(has_mail_format("mymail@domain."))

    def test_has_password_format(self):
        self.assertTrue(has_password_format("MyPass123!"))
        self.assertTrue(has_password_format("aaa!aaaaaaaaaaa1aaaaaaaaaaA"))
        self.assertFalse(has_password_format("MyPass123"))
        self.assertFalse(has_password_format("MyPasssss!"))
        self.assertFalse(has_password_format("mypass123!"))
        self.assertFalse(has_password_format("myPa1!"))
        self.assertFalse(has_password_format("MyPaaaaaaaaaaasssssssssssssssssssssssssssssssssssssssssssss1!"))

    def test_has_date_format(self):
        self.assertTrue(has_date_format("2020-01-01"))
        self.assertFalse(has_date_format("111-01-02"))
        self.assertFalse(has_date_format("a111-01-01"))
        self.assertFalse(has_date_format("01-01-2020"))
        self.assertFalse(has_date_format("2020-00-01"))
        self.assertFalse(has_date_format("2020-01-00"))
