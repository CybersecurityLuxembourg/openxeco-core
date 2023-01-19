from test.BaseCase import BaseCase


class TestDeleteTemplate(BaseCase):

    @BaseCase.login
    @BaseCase.grant_access("/mail/delete_template")
    def test_ok(self, token):
        self.db.insert({"name": "ACCOUNT_CREATION", "content": "<p>Hi!</p>"}, self.db.tables["EmailTemplate"])

        payload = {
            "name": "account_CREATION",
        }

        response = self.application.post('/mail/delete_template',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual(200, response.status_code)
        self.assertEqual(0, self.db.get_count(self.db.tables["EmailTemplate"]))

    @BaseCase.login
    @BaseCase.grant_access("/mail/delete_template")
    def test_unknown_template(self, token):

        payload = {
            "name": "account_CREATION",
        }

        response = self.application.post('/mail/delete_template',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual("422 This email template exists but has no content defined", response.status)

    @BaseCase.login
    @BaseCase.grant_access("/mail/delete_template")
    def test_wrong_template_name(self, token):

        payload = {
            "name": "Wrong_name",
        }

        response = self.application.post('/mail/delete_template',
                                        headers=self.get_standard_header(token),
                                        json=payload)

        self.assertEqual("404 This email template does not exist", response.status)
