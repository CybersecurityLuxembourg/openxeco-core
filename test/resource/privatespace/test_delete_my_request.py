from test.BaseCase import BaseCase


class TestDeleteCompany(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        self.db.insert({"id": 2, "user_id": 1, "request": "My request"}, self.db.tables["UserRequest"])

        payload = {"id": 2}

        response = self.application.post('/privatespace/delete_my_request',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual(200, response.status_code)

    @BaseCase.login
    def test_delete_unexisting(self, token):

        payload = {"id": 2}

        response = self.application.post('/privatespace/delete_my_request',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual(500, response.status_code)
