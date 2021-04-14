from test.BaseCase import BaseCase


class TestGetUserGroup(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        self.db.insert({"id": 14, "name": "My GROUP"}, self.db.tables["UserGroup"])

        response = self.application.get('/user/get_user_group/14',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)
        self.assertEqual({"id": 14, "name": "My GROUP"}, response.json)

    @BaseCase.login
    def test_unexisting_id(self, token):
        response = self.application.get('/user/get_user_group/4',
                                        headers=self.get_standard_header(token))

        self.assertEqual("422 Object not found", response.status)
