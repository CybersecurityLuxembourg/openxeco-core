from test.BaseCase import BaseCase


class TestGetCompanyWorkforces(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        self.db.insert({"name": "Newspaper"}, self.db.tables["Source"])
        self.db.insert({"id": 1, "name": "Company1"}, self.db.tables["Company"])
        self.db.insert({
            "id": 1,
            "company": 1,
            "workforce": 15,
            "date": "2020-01-01",
            "is_estimated": True,
            "source": "Newspaper",
        }, self.db.tables["Workforce"])

        response = self.application.get('/company/get_company_workforces/1', headers=self.get_standard_header(token))

        self.assertEqual(1, len(response.json))
        self.assertEqual(200, response.status_code)

    @BaseCase.login
    def test_ok_empty(self, token):

        response = self.application.get('/company/get_company_workforces/2', headers=self.get_standard_header(token))

        self.assertEqual(response.json, [])
        self.assertEqual(200, response.status_code)
