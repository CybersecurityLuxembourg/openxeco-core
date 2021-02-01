from test.BaseCase import BaseCase
from unittest.mock import patch
import datetime


class TestUpdateAddress(BaseCase):

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

        payload = {
            "id": 1,
            "company_id": 2,
            "address_1": "Rue inconnue 2",
            "address_2": None,
            "number": None,
            "postal_code": "1516",
            "city": "Luxembourg",
            "administrative_area": None,
            "country": "Luxembourg",
            "latitude": 1,
            "longitude": 1.2,
        }

        response = self.application.post('/address/update_address',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        address = self.db.get(self.db.tables["Company_Address"], {"id": 1})

        self.assertEqual(200, response.status_code)
        self.assertEqual(len(address), 1)
        self.assertEqual(address[0].postal_code, "1516")
        self.assertEqual(address[0].address_1, "Rue inconnue 2")
        self.assertEqual(address[0].latitude, 1)
        self.assertEqual(float(address[0].longitude), 1.2)
