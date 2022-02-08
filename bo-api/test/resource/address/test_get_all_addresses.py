from test.BaseCase import BaseCase


class TestGetAllAddresses(BaseCase):

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
        }, self.db.tables["Company_Address"])

        response = self.application.get('/address/get_all_addresses', headers=self.get_standard_header(token))

        self.assertEqual(1, len(response.json))
        self.assertEqual(200, response.status_code)
