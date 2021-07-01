from test.BaseCase import BaseCase


class TestDeleteMyRequest(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        payload = {"id": 2}

        response = self.application.post('/private/delete_my_request',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual(200, response.status_code)

    @BaseCase.login
    def test_delete_unexisting(self, token):

        payload = {"id": 2}

        response = self.application.post('/private/delete_my_request',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual("422 Object not found", response.status)
