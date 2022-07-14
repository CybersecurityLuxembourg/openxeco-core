from test.BaseCase import BaseCase


class TestGetCompanyAddresses(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        self.db.insert({"id": 2, "name": "My Company"}, self.db.tables["Company"])
        self.db.insert({
            "id": 1,
            "company_id": 2,
            "address_1": "Rue inconnue",
            "address_2": None,
            "number": None,
            "postal_code": "1515",
            "city": "Luxembourg",
            "administrative_area": None,
            "country": "Luxembourg",
            "latitude": None,
            "longitude": None,
        }, self.db.tables["CompanyAddress"])
        self.db.insert({
            "id": 2,
            "company_id": 2,
            "address_1": "Rue inconnue",
            "address_2": None,
            "number": None,
            "postal_code": "1515",
            "city": "Luxembourg",
            "administrative_area": None,
            "country": "Luxembourg",
            "latitude": None,
            "longitude": None,
        }, self.db.tables["CompanyAddress"])

        response = self.application.get('/company/get_company_addresses/2', headers=self.get_standard_header(token))

        self.assertEqual(2, len(response.json))
        self.assertEqual(200, response.status_code)

    @BaseCase.login
    def test_ok_empty(self, token):

        response = self.application.get('/company/get_company_addresses/2', headers=self.get_standard_header(token))

        self.assertEqual(response.json, [])
        self.assertEqual(200, response.status_code)
