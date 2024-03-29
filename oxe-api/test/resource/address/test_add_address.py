from test.BaseCase import BaseCase


class TestAddAddress(BaseCase):

    @BaseCase.login
    @BaseCase.grant_access("/address/add_address")
    def test_ok(self, token):
        self.db.insert({"id": 2, "name": "My Entity"}, self.db.tables["Entity"])

        payload = {
            "entity_id": 2,
            "address_1": "Rue inconnue",
            "address_2": None,
            "number": None,
            "postal_code": "1515",
            "city": "Luxembourg",
            "administrative_area": None,
            "country": "Luxembourg",
            "latitude": None,
            "longitude": None,
        }

        response = self.application.post('/address/add_address',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual(200, response.status_code)
        self.assertEqual(self.db.get_count(self.db.tables["EntityAddress"]), 1)

    @BaseCase.login
    @BaseCase.grant_access("/address/add_address")
    def test_ok_without_none(self, token):
        payload = {
            "entity_id": 2,
            "address_1": "Rue inconnue",
            "postal_code": "1515",
            "city": "Luxembourg",
            "country": "Luxembourg",
        }

        response = self.application.post('/address/add_address',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual(422, response.status_code)
        self.assertEqual("422 Provided entity not existing", response.status)

    @BaseCase.login
    @BaseCase.grant_access("/address/add_address")
    def test_ko_missing_entity(self, token):
        payload = {
            "entity_id": 2,
            "address_1": "Rue inconnue",
            "address_2": None,
            "number": None,
            "postal_code": "1515",
            "city": "Luxembourg",
            "administrative_area": None,
            "country": "Luxembourg",
            "latitude": None,
            "longitude": None,
        }

        response = self.application.post('/address/add_address',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual(422, response.status_code)
        self.assertEqual("422 Provided entity not existing", response.status)
