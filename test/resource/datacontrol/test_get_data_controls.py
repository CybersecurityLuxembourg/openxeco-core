from test.BaseCase import BaseCase


class TestGetDataControls(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        self.db.insert({"category": "CAT", "value": "val1"}, self.db.tables["DataControl"])
        self.db.insert({"category": "CAT2", "value": "val2"}, self.db.tables["DataControl"])

        response = self.application.get('/datacontrol/get_data_controls', headers=self.get_standard_header(token))

        self.assertEqual(len(response.json), 2)
        self.assertEqual(response.json[0], {'category': 'CAT', 'id': 1, 'value': 'val1'})
        self.assertEqual(response.json[1], {'category': 'CAT2', 'id': 2, 'value': 'val2'})
        self.assertEqual(200, response.status_code)
