from test.BaseCase import BaseCase


class TestGetPublicObjectCount(BaseCase):

    @BaseCase.login
    def test_ok_empty(self, token):
        response = self.application.get('/public/get_public_object_count',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)
        self.assertEqual(response.json, {
            'entity': {'total': 0},
            'article': {'total': 0},
            'taxonomy': {},
        })

    @BaseCase.login
    def test_ok_empty(self, token):
        self.db.insert({
            "name": "My entity",
            "creation_date": "2020-06-06",
        }, self.db.tables["Entity"])
        self.db.insert({
            "name": "My entity 2",
            "creation_date": None,
        }, self.db.tables["Entity"])
        self.db.insert({
            "name": "My entity 3",
            "creation_date": None,
        }, self.db.tables["Entity"])

        response = self.application.get('/public/get_public_object_count',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)
        self.assertEqual(response.json, {
            'entity': {'total': 0},
            'article': {'total': 0},
            'taxonomy': {},
        })
