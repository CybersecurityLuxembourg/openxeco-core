from test.BaseCase import BaseCase


class TestGetCompanies(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        self.db.insert({"id": 2, "name": "My Company"}, self.db.tables["Company"])
        self.db.insert({"id": 3, "name": "My Company 2"}, self.db.tables["Company"])

        response = self.application.get('/company/get_companies',
                                        headers=self.get_standard_header(token))

        self.assertEqual(2, len(response.json))
        self.assertEqual(200, response.status_code)

    @BaseCase.login
    def test_ok_with_params(self, token):
        self.db.insert({"id": 2, "name": "My Company"}, self.db.tables["Company"])
        self.db.insert({"id": 3, "name": "My Company 2"}, self.db.tables["Company"])

        response = self.application.get('/company/get_companies?name=2',
                                        headers=self.get_standard_header(token))

        self.assertEqual(1, len(response.json))
        self.assertEqual(3, response.json[0]["id"])
        self.assertEqual(200, response.status_code)
