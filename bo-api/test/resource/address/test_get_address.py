from test.BaseCase import BaseCase


class TestGetCompany(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        self.db.insert({"id": 1, "name": "My Company"}, self.db.tables["Company"])
        self.db.insert({"id": 2, "company_id": 1, "address_1": "a", "city": "a", "country": "b"},
                       self.db.tables["Company_Address"])

        response = self.application.get('/address/get_address/2',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)

    @BaseCase.login
    def test_unexisting_id(self, token):
        response = self.application.get('/address/get_address/4',
                                        headers=self.get_standard_header(token))

        self.assertEqual("422 Object not found", response.status)
