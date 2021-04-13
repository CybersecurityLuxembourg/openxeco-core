from test.BaseCase import BaseCase


class TestGetPublicCompanyGeolocations(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        self.db.insert({"id": 2, "name": "My Company"}, self.db.tables["Company"])
        self.db.insert({"id": 3, "name": "My Company 2"}, self.db.tables["Company"])
        self.db.insert({"id": 4, "name": "My Company 3"}, self.db.tables["Company"])

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
            "latitude": 1,
            "longitude": 2,
        }, self.db.tables["Company_Address"])

        self.db.insert({
            "id": 2,
            "company_id": 3,
            "address_1": "Rue inconnue",
            "address_2": None,
            "number": None,
            "postal_code": "1515",
            "city": "Luxembourg",
            "administrative_area": None,
            "country": "Luxembourg",
            "latitude": 13,
            "longitude": 14,
        }, self.db.tables["Company_Address"])

        response = self.application.get('/public/get_public_company_geolocations',
                                        headers=self.get_standard_header(token))

        self.assertEqual(2, len(response.json))
        self.assertEqual(200, response.status_code)
        self.assertEqual(response.json, [
            {
                'company_id': 2,
                "latitude": 1.0,
                "longitude": 2.0,
            },
            {
                'company_id': 3,
                "latitude": 13.0,
                "longitude": 14.0,
            }
        ])
