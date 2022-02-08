from test.BaseCase import BaseCase


class TestGetRequests(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        self.db.insert({"id": 2, "user_id": 1, "request": "My request 1", 'submission_date': '2021-06-10T10:57:30'}
                       , self.db.tables["UserRequest"])
        self.db.insert({"id": 3, "user_id": 1, "request": "My request 2", 'submission_date': '2021-06-10T10:57:30'}
                       , self.db.tables["UserRequest"])

        response = self.application.get('/request/get_requests',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)
        self.assertEqual(response.json, {
            'pagination':
                {
                    'page': 1,
                    'pages': 1,
                    'per_page': 50,
                    'total': 2
                },
            'items': [
                {
                    'id': 2,
                    'user_id': 1,
                    'company_id': None,
                    'status': 'NEW',
                    'request': 'My request 1',
                    'data': None, 'image': None,
                    'submission_date': '2021-06-10T10:57:30',
                    'type': None
                },
                {
                    'id': 3,
                    'user_id': 1,
                    'company_id': None,
                    'status': 'NEW',
                    'request': 'My request 2',
                    'data': None,
                    'image': None,
                    'submission_date': '2021-06-10T10:57:30',
                    'type': None
                }
            ]
        })

    @BaseCase.login
    def test_ok_with_status(self, token):
        self.db.insert({"id": 2, "user_id": 1, "request": "My request 1", "status": "NEW",
                        'submission_date': '2021-06-10T10:57:30'}, self.db.tables["UserRequest"])
        self.db.insert({"id": 3, "user_id": 1, "request": "My request 2", "status": "IN PROCESS",
                        'submission_date': '2021-06-10T10:57:30'}, self.db.tables["UserRequest"])

        response = self.application.get('/request/get_requests?status=NEW',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)
        self.assertEqual(response.json, {
            'pagination':
                {
                    'page': 1,
                    'pages': 1,
                    'per_page': 50,
                    'total': 1
                },
            'items': [
                {
                    'id': 2,
                    'user_id': 1,
                    'company_id': None,
                    'status': 'NEW',
                    'request': 'My request 1',
                    'data': None,
                    'image': None,
                    'submission_date': '2021-06-10T10:57:30',
                    'type': None
                }
            ]
        })
