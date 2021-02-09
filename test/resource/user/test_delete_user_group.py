from test.BaseCase import BaseCase


class TestDeleteUserGroup(BaseCase):

    @BaseCase.login
    @BaseCase.grant_access("/user/delete_user_group")
    def test_ok(self, token):
        self.db.insert({"id": 14, "name": "My GROUP"}, self.db.tables["UserGroup"])
        self.db.insert({"group_id": 14, "resource": "RESOURCE"}, self.db.tables["UserGroupRight"])
        self.db.insert({"group_id": 14, "user_id": 1}, self.db.tables["UserGroupAssignment"])

        # Pre-verification

        groups = self.db.get(self.db.tables["UserGroup"])
        group_rights = self.db.get(self.db.tables["UserGroupRight"], {"group_id": 14})
        group_assignments = self.db.get(self.db.tables["UserGroupAssignment"], {"group_id": 14})

        self.assertEqual(len(groups), 2)
        self.assertEqual(len(group_rights), 1)
        self.assertEqual(len(group_assignments), 1)

        # Query

        payload = {
            "id": 14,
        }

        response = self.application.post('/user/delete_user_group',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        #Post-verification

        groups = self.db.get(self.db.tables["UserGroup"])
        deleted_group_rights = self.db.get(self.db.tables["UserGroupRight"], {"group_id": 14})
        deleted_group_assignments = self.db.get(self.db.tables["UserGroupAssignment"], {"group_id": 14})

        self.assertEqual(200, response.status_code)
        self.assertEqual(len(groups), 1)
        self.assertEqual(len(deleted_group_rights), 0)
        self.assertEqual(len(deleted_group_assignments), 0)

    @BaseCase.login
    @BaseCase.grant_access("/user/delete_user_group")
    def test_delete_unexisting(self, token):

        payload = {
            "id": 14,
        }

        response = self.application.post('/user/delete_user_group',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual(500, response.status_code)
        self.assertEqual("500 Object not found", response.status)
