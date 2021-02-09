from test.BaseCase import BaseCase


class TestGetUserGroupRights(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        self.db.insert({"id": 14, "name": "My GROUP"}, self.db.tables["UserGroup"])
        self.db.insert({"group_id": 14, "resource": "RESOURCE"}, self.db.tables["UserGroupRight"])

        response = self.application.get('/user/get_user_group_rights/14',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)
        self.assertEqual([{'group_id': 14, 'parameter': None, 'resource': 'RESOURCE'}], response.json)
