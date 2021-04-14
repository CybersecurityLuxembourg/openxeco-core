from test.BaseCase import BaseCase


class TestAddUserGroupRight(BaseCase):

    @BaseCase.login
    @BaseCase.grant_access("/user/add_user_group_right")
    def test_ok(self, token):
        self.db.insert({"id": 14, "name": "My GROUP"}, self.db.tables["UserGroup"])

        payload = {
            "group": 14,
            "resource": "/user/example_resource"
        }

        response = self.application.post('/user/add_user_group_right',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        rights = self.db.get(self.db.tables["UserGroupRight"])
        new_rights = self.db.get(self.db.tables["UserGroupRight"], {"group_id": 14})

        self.assertEqual(200, response.status_code)
        self.assertEqual(len(rights), 2)
        self.assertEqual(len(new_rights), 1)
        self.assertEqual(new_rights[0].resource, "/user/example_resource")

    @BaseCase.login
    @BaseCase.grant_access("/user/add_user_group_right")
    def test_ko_already_existing(self, token):
        self.db.insert({"id": 14, "name": "My GROUP"}, self.db.tables["UserGroup"])
        self.db.insert({"group_id": 14, "resource": "/user/example_resource"}, self.db.tables["UserGroupRight"])

        payload = {
            "group": 14,
            "resource": "/user/example_resource"
        }

        response = self.application.post('/user/add_user_group_right',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        new_rights = self.db.get(self.db.tables["UserGroupRight"], {"group_id": 14})

        self.assertEqual("422 Object already existing", response.status)
        self.assertEqual(len(new_rights), 1)
        self.assertEqual(new_rights[0].resource, "/user/example_resource")
