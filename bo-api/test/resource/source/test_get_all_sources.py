from test.BaseCase import BaseCase


class TestGetAllSources(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        self.db.insert({"name": "Newspaper"}, self.db.tables["Source"])
        self.db.insert({"name": "Newspaper2"}, self.db.tables["Source"])

        response = self.application.get('/source/get_all_sources', headers=self.get_standard_header(token))

        self.assertEqual(["Newspaper", "Newspaper2"], response.json)
        self.assertEqual(200, response.status_code)
