from test.BaseCase import BaseCase


class TestDeleteEntity(BaseCase):

    @BaseCase.login
    @BaseCase.grant_access("/entity/delete_entity")
    def test_ok(self, token):
        self.db.insert({"id": 2, "name": "My Entity"}, self.db.tables["Entity"])

        payload = {"id": 2}

        response = self.application.post('/entity/delete_entity',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual(200, response.status_code)

    @BaseCase.login
    @BaseCase.grant_access("/entity/delete_entity")
    def test_delete_unexisting(self, token):
        payload = {"id": 2}

        response = self.application.post('/entity/delete_entity',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual("422 Object not found", response.status)
