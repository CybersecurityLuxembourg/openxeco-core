from test.BaseCase import BaseCase


class TestDeleteDataControl(BaseCase):

    @BaseCase.login
    @BaseCase.grant_access("/datacontrol/delete_data_control")
    def test_ok(self, token):
        self.db.insert({"id": 1, "category": "CAT", "value": "val1"}, self.db.tables["DataControl"])

        payload = {"id": 1}

        response = self.application.post('/datacontrol/delete_data_control',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual(200, response.status_code)
        self.assertEqual(self.db.get_count(self.db.tables["DataControl"]), 0)

    @BaseCase.login
    @BaseCase.grant_access("/datacontrol/delete_data_control")
    def test_delete_unexisting(self, token):
        payload = {"id": 1}

        response = self.application.post('/datacontrol/delete_data_control',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual("422 Object not found", response.status)
