from test.BaseCase import BaseCase


class TestDeleteCompany(BaseCase):

    @BaseCase.login
    @BaseCase.grant_access("/company/delete_company")
    def test_ok(self, token):
        self.db.insert({"id": 2, "name": "My Company"}, self.db.tables["Company"])

        payload = {"id": 2}

        response = self.application.post('/company/delete_company',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual(200, response.status_code)

    @BaseCase.login
    @BaseCase.grant_access("/company/delete_company")
    def test_delete_unexisting(self, token):
        payload = {"id": 2}

        response = self.application.post('/company/delete_company',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual(500, response.status_code)
