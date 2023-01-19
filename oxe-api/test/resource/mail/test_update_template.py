from test.BaseCase import BaseCase


class TestUpdateTemplate(BaseCase):

    @BaseCase.login
    @BaseCase.grant_access("/mail/update_template")
    def test_ok_with_existing_template(self, token):
        self.db.insert({"name": "ACCOUNT_CREATION", "content": "<p>Hi!</p>"}, self.db.tables["EmailTemplate"])

        payload = {
            "name": "account_creation",
            "content": "<h1>Bye!</h1>"
        }

        response = self.application.post('/mail/update_template',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual(200, response.status_code)
        self.assertEqual("<h1>Bye!</h1>", self.db.get(self.db.tables["EmailTemplate"])[0].content)

    @BaseCase.login
    @BaseCase.grant_access("/mail/update_template")
    def test_ok_with_no_template(self, token):

        payload = {
            "name": "account_creation",
            "content": "<h1>Bye!</h1>"
        }

        response = self.application.post('/mail/update_template',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual(200, response.status_code)
        self.assertEqual(1, self.db.get_count(self.db.tables["EmailTemplate"]))

    @BaseCase.login
    @BaseCase.grant_access("/mail/update_template")
    def test_unknown_template(self, token):

        payload = {
            "name": "unknown_template",
            "content": "<h1>data</h1>"
        }

        response = self.application.post('/mail/update_template',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual("404 This email template does not exist", response.status)
