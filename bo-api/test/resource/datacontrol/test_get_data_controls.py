from test.BaseCase import BaseCase


class TestGetDataControls(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        self.db.insert({"category": "CAT", "value": "val1"}, self.db.tables["DataControl"])
        self.db.insert({"category": "CAT2", "value": "val2"}, self.db.tables["DataControl"])

        response = self.application.get('/datacontrol/get_data_controls', headers=self.get_standard_header(token))

        self.assertEqual(response.status_code, 200)
        self.assertEqual({
            'pagination':
                {
                    'page': 1,
                    'pages': 1,
                    'per_page': 50,
                    'total': 2
                },
            'items': [
                {
                    'id': 1,
                    'category': 'CAT',
                    'value':'val1'
                },
                {
                    'id': 2,
                    'category': 'CAT2',
                    'value': 'val2'
                }
            ]
        }, response.json)
