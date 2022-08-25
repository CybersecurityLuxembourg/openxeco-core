from test.BaseCase import BaseCase


class TestGetEntityContacts(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        self.db.insert({"id": 2, "name": "My Entity"}, self.db.tables["Entity"])
        self.db.insert({
            "id": 1,
            "entity_id": 2,
            "type": "PHONE NUMBER",
            "representative": "ENTITY",
            "name": None,
            "value": "+123456896",
        }, self.db.tables["EntityContact"])
        self.db.insert({
            "id": 2,
            "entity_id": 2,
            "type": "EMAIL ADDRESS",
            "representative": "PHYSICAL PERSON",
            "name": "Name",
            "value": "+123456896",
        }, self.db.tables["EntityContact"])

        response = self.application.get('/entity/get_entity_contacts/2', headers=self.get_standard_header(token))

        self.assertEqual(2, len(response.json))
        self.assertEqual(200, response.status_code)

    @BaseCase.login
    def test_ok_empty(self, token):

        response = self.application.get('/entity/get_entity_contacts/2', headers=self.get_standard_header(token))

        self.assertEqual(response.json, [])
        self.assertEqual(200, response.status_code)
