from test.BaseCase import BaseCase


class TestGetEntity(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        self.db.insert({"id": 2, "name": "My Entity"}, self.db.tables["Entity"])

        response = self.application.get('/entity/get_entity/2',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)

    @BaseCase.login
    def test_unexisting_id(self, token):
        response = self.application.get('/entity/get_entity/4',
                                        headers=self.get_standard_header(token))

        self.assertEqual("422 Object not found", response.status)
