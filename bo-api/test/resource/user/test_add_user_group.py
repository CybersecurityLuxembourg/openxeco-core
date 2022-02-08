from test.BaseCase import BaseCase


class TestAddUserGroup(BaseCase):

    @BaseCase.login
    @BaseCase.grant_access("/user/add_user_group")
    def test_ok(self, token):

        payload = {"name": "My GROUP"}

        response = self.application.post('/user/add_user_group',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        groups = self.db.get(self.db.tables["UserGroup"])

        self.assertEqual(200, response.status_code)
        self.assertEqual(len(groups), 2)
        self.assertEqual(groups[1].name, "My GROUP")
