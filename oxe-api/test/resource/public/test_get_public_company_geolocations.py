from test.BaseCase import BaseCase


class TestGetPublicEntityGeolocations(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        self.db.insert({"id": 2, "name": "My Entity"}, self.db.tables["Entity"])
        self.db.insert({"id": 3, "name": "My Entity 2", "status": "INACTIVE"}, self.db.tables["Entity"])
        self.db.insert({"id": 4, "name": "My Entity 3"}, self.db.tables["Entity"])

        self.db.insert({
            "id": 1,
            "entity_id": 2,
            "address_1": "Rue inconnue",
            "address_2": None,
            "number": None,
            "postal_code": "1515",
            "city": "Luxembourg",
            "administrative_area": None,
            "country": "Luxembourg",
            "latitude": 1,
            "longitude": 2,
        }, self.db.tables["EntityAddress"])

        self.db.insert({
            "id": 2,
            "entity_id": 3,
            "address_1": "Rue inconnue",
            "address_2": None,
            "number": None,
            "postal_code": "1515",
            "city": "Luxembourg",
            "administrative_area": None,
            "country": "Luxembourg",
            "latitude": 13,
            "longitude": 14,
        }, self.db.tables["EntityAddress"])

        response = self.application.get('/public/get_public_entity_geolocations',
                                        headers=self.get_standard_header(token))

        self.assertEqual(1, len(response.json))
        self.assertEqual(200, response.status_code)
        self.assertEqual(response.json, [
            {
                'entity_id': 2,
                "latitude": 1.0,
                "longitude": 2.0,
            },
        ])

    @BaseCase.login
    def test_ok_including_inactive(self, token):
        self.db.insert({"id": 2, "name": "My Entity"}, self.db.tables["Entity"])
        self.db.insert({"id": 3, "name": "My Entity 2", "status": "INACTIVE"}, self.db.tables["Entity"])
        self.db.insert({"id": 4, "name": "My Entity 3"}, self.db.tables["Entity"])

        self.db.insert({
            "id": 1,
            "entity_id": 2,
            "address_1": "Rue inconnue",
            "address_2": None,
            "number": None,
            "postal_code": "1515",
            "city": "Luxembourg",
            "administrative_area": None,
            "country": "Luxembourg",
            "latitude": 1,
            "longitude": 2,
        }, self.db.tables["EntityAddress"])

        self.db.insert({
            "id": 2,
            "entity_id": 3,
            "address_1": "Rue inconnue",
            "address_2": None,
            "number": None,
            "postal_code": "1515",
            "city": "Luxembourg",
            "administrative_area": None,
            "country": "Luxembourg",
            "latitude": 13,
            "longitude": 14,
        }, self.db.tables["EntityAddress"])

        response = self.application.get('/public/get_public_entity_geolocations?include_inactive=true',
                                        headers=self.get_standard_header(token))

        self.assertEqual(2, len(response.json))
        self.assertEqual(200, response.status_code)
        self.assertEqual(response.json, [
            {
                'entity_id': 2,
                "latitude": 1.0,
                "longitude": 2.0,
            },
            {
                'entity_id': 3,
                "latitude": 13.0,
                "longitude": 14.0,
            }
        ])