from test.BaseCase import BaseCase


class TestGetUserGroupAssignments(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        self.db.insert({"id": 14, "name": "My GROUP"}, self.db.tables["UserGroup"])
        self.db.insert({"group_id": 14, "resource": "RESOURCE"}, self.db.tables["UserGroupRight"])
        self.db.insert({"group_id": 14, "user_id": 1}, self.db.tables["UserGroupAssignment"])

        response = self.application.get('/user/get_user_group_assignments',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)
        self.assertEqual([{'group_id': 14, 'user_id': 1}], response.json)
