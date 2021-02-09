from test.BaseCase import BaseCase


class TestGetUserGroups(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        self.db.insert({"id": 14, "name": "My GROUP"}, self.db.tables["UserGroup"])

        response = self.application.get('/user/get_user_groups',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)
        self.assertEqual([{'id': 14, 'name': 'My GROUP'}], response.json)
