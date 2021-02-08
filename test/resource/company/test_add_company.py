from test.BaseCase import BaseCase


class TestAddCompany(BaseCase):

    @BaseCase.login
    @BaseCase.grant_access("/company/add_company")
    def test_ok(self, token):
        self.db.insert({"id": 2, "name": "My Company"}, self.db.tables["Company"])

        payload = {"name": "My Company 2"}

        response = self.application.post('/company/add_company',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual(200, response.status_code)
        self.assertEqual(self.db.get_count(self.db.tables["Company"]), 2)
