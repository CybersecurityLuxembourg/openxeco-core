from test.BaseCase import BaseCase


class TestGetEntities(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        self.db.insert({"id": 2, "name": "My Entity"}, self.db.tables["Entity"])
        self.db.insert({"id": 3, "name": "My Entity 2"}, self.db.tables["Entity"])

        response = self.application.get('/entity/get_entities',
                                        headers=self.get_standard_header(token))

        self.assertEqual(2, len(response.json))
        self.assertEqual(200, response.status_code)

    @BaseCase.login
    def test_ok_with_params(self, token):
        self.db.insert({"id": 2, "name": "My Entity"}, self.db.tables["Entity"])
        self.db.insert({"id": 3, "name": "My Entity 2"}, self.db.tables["Entity"])

        response = self.application.get('/entity/get_entities?name=2',
                                        headers=self.get_standard_header(token))

        self.assertEqual(1, len(response.json))
        self.assertEqual(3, response.json[0]["id"])
        self.assertEqual(200, response.status_code)
