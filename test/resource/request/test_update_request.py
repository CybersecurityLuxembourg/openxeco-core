from test.BaseCase import BaseCase


class TestUpdateRequest(BaseCase):

    @BaseCase.login
    @BaseCase.grant_access("/request/update_request")
    def test_ok(self, token):
        self.db.insert({"id": 2, "user_id": 1, "request": "My request"}, self.db.tables["UserRequest"])
        self.db.insert({"id": 3, "user_id": 1, "request": "My request"}, self.db.tables["UserRequest"])

        payload = {
            "id": 2,
            "status": "IN PROCESS",
        }

        response = self.application.post('/request/update_request',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        request = self.db.get(self.db.tables["UserRequest"], {"id": 2})

        self.assertEqual(200, response.status_code)
        self.assertEqual(len(request), 1)
        self.assertEqual(request[0].status, "IN PROCESS")
