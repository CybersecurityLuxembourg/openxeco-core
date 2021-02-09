from test.BaseCase import BaseCase


class TestDeleteUserGroupRight(BaseCase):

    @BaseCase.login
    @BaseCase.grant_access("/user/delete_user_group_right")
    def test_ok(self, token):
        self.db.insert({"id": 14, "name": "My GROUP"}, self.db.tables["UserGroup"])
        self.db.insert({"group_id": 14, "resource": "RESOURCE"}, self.db.tables["UserGroupRight"])

        payload = {
            "group": 14,
            "resource": "RESOURCE"
        }

        response = self.application.post('/user/delete_user_group_right',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        rights = self.db.get(self.db.tables["UserGroupRight"])
        new_rights = self.db.get(self.db.tables["UserGroupRight"], {"group_id": 14})

        self.assertEqual(200, response.status_code)
        self.assertEqual(len(rights), 1)
        self.assertEqual(len(new_rights), 0)

    @BaseCase.login
    @BaseCase.grant_access("/user/delete_user_group_right")
    def test_delete_unexisting(self, token):
        self.db.insert({"id": 14, "name": "My GROUP"}, self.db.tables["UserGroup"])
        self.db.insert({"group_id": 14, "resource": "RESOURCE"}, self.db.tables["UserGroupRight"])

        payload = {
            "group": 14,
            "resource": "WRONG RESOURCE"
        }

        response = self.application.post('/user/delete_user_group_right',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual(500, response.status_code)
        self.assertEqual("500 Object not found", response.status)
