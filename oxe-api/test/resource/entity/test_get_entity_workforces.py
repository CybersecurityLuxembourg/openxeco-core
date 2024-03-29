from test.BaseCase import BaseCase


class TestGetEntityWorkforces(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        self.db.insert({"id": 1, "name": "Entity1"}, self.db.tables["Entity"])
        self.db.insert({
            "id": 1,
            "entity_id": 1,
            "workforce": 15,
            "date": "2020-01-01",
            "is_estimated": True,
            "source": "Newspaper",
        }, self.db.tables["Workforce"])

        response = self.application.get('/entity/get_entity_workforces/1', headers=self.get_standard_header(token))

        self.assertEqual(1, len(response.json))
        self.assertEqual(200, response.status_code)

    @BaseCase.login
    def test_ok_empty(self, token):

        response = self.application.get('/entity/get_entity_workforces/2', headers=self.get_standard_header(token))

        self.assertEqual(response.json, [])
        self.assertEqual(200, response.status_code)
