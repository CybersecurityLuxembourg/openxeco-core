from test.BaseCase import BaseCase


class TestAddEntity(BaseCase):

    @BaseCase.login
    @BaseCase.grant_access("/entity/add_entity")
    def test_ok(self, token):
        self.db.insert({"id": 2, "name": "My Entity"}, self.db.tables["Entity"])

        payload = {"name": "My Entity 2"}

        response = self.application.post('/entity/add_entity',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual(200, response.status_code)
        self.assertEqual(self.db.get_count(self.db.tables["Entity"]), 2)

    @BaseCase.login
    @BaseCase.grant_access("/entity/add_entity")
    def test_ko_with_same_name(self, token):
        self.db.insert({"id": 2, "name": "My Entity"}, self.db.tables["Entity"])

        payload = {"name": "My Entity"}

        response = self.application.post('/entity/add_entity',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual("422 A entity is already existing with that name", response.status)
        self.assertEqual(self.db.get_count(self.db.tables["Entity"]), 1)
