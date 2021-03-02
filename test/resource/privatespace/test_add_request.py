from test.BaseCase import BaseCase


class TestAddRequest(BaseCase):

    @BaseCase.login
    def test_ok(self, token):

        payload = {"request": "My request"}

        response = self.application.post('/privatespace/add_request',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual(200, response.status_code)
        self.assertEqual(self.db.get_count(self.db.tables["UserRequest"]), 1)
