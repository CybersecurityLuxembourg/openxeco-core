import os

from test.BaseCase import BaseCase


class TestGetTemplate(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        path = os.path.join(
            os.path.dirname(os.path.realpath(__file__)), "..", "..", "..", "template", "account_creation.html"
        )

        response = self.application.get('/mail/get_template?name=ACCOUNT_creation',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)
        with open(path) as file:
            self.assertEqual(file.read(), response.json)

    @BaseCase.login
    def test_ok_2(self, token):
        path = os.path.join(
            os.path.dirname(os.path.realpath(__file__)), "..", "..", "..", "template", "password_reset.html"
        )

        response = self.application.get('/mail/get_template?name=PASSWORD_reset',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)
        with open(path) as file:
            self.assertEqual(file.read(), response.json)

    @BaseCase.login
    def test_ok_3(self, token):
        path = os.path.join(
            os.path.dirname(os.path.realpath(__file__)), "..", "..", "..", "template", "request_notification.html"
        )

        response = self.application.get('/mail/get_template?name=REQUEST_notification',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)
        with open(path) as file:
            self.assertEqual(file.read(), response.json)

    @BaseCase.login
    def test_ok_with_custom_template(self, token):
        self.db.insert({"name": "REQUEST_NOTIFICATION", "content": "<p>Hi!</p>"}, self.db.tables["EmailTemplate"])

        response = self.application.get('/mail/get_template?name=REQUEST_notification',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)
        self.assertEqual("<p>Hi!</p>", response.json)

    @BaseCase.login
    def test_wrong_template_name(self, token):
        response = self.application.get('/mail/get_template?name=wrong_name',
                                        headers=self.get_standard_header(token))

        self.assertEqual("404 This email template does not exist", response.status)
