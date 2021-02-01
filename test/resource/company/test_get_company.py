from test.BaseCase import BaseCase


class TestGetCompany(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        self.db.insert({"id": 2, "name": "My Company"}, self.db.tables["Company"])

        response = self.application.get('/company/get_company/2',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)

    @BaseCase.login
    def test_unexisting_id(self, token):
        response = self.application.get('/company/get_company/4',
                                        headers=self.get_standard_header(token))

        self.assertEqual(500, response.status_code)
