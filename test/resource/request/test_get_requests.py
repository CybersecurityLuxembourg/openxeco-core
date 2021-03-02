from test.BaseCase import BaseCase


class TestGetRequests(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        self.db.insert({"id": 2, "user_id": 1, "request": "My request 1"}, self.db.tables["UserRequest"])
        self.db.insert({"id": 3, "user_id": 1, "request": "My request 2"}, self.db.tables["UserRequest"])

        response = self.application.get('/request/get_requests',
                                        headers=self.get_standard_header(token))

        self.assertEqual(2, len(response.json))
        self.assertEqual(200, response.status_code)

        self.assertEqual(response.json[0]['id'], 2)
        self.assertEqual(response.json[0]['status'], 'NEW')
        self.assertEqual(response.json[0]['user_id'], 1)
        self.assertEqual(response.json[0]['request'], "My request 1")

        self.assertEqual(response.json[1]['id'], 3)
        self.assertEqual(response.json[1]['status'], 'NEW')
        self.assertEqual(response.json[1]['user_id'], 1)
        self.assertEqual(response.json[1]['request'], "My request 2")

    @BaseCase.login
    def test_ok_with_status(self, token):
        self.db.insert({"id": 2, "user_id": 1, "request": "My request 1", "status": "NEW"},
                       self.db.tables["UserRequest"])
        self.db.insert({"id": 3, "user_id": 1, "request": "My request 2", "status": "IN PROCESS"},
                       self.db.tables["UserRequest"])

        response = self.application.get('/request/get_requests?status=NEW',
                                        headers=self.get_standard_header(token))

        self.assertEqual(1, len(response.json))
        self.assertEqual(200, response.status_code)

        self.assertEqual(response.json[0]['status'], 'NEW')

