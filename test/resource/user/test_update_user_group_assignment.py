from test.BaseCase import BaseCase


class TestUpdateUserGroupAssignment(BaseCase):

    @BaseCase.login
    @BaseCase.grant_access("/user/update_user_group_assignment")
    def test_ok(self, token):
        self.db.insert({"id": 14, "email": "myemail@test.lu", "password": "MySecret2!", "is_admin": 0},
                       self.db.tables["User"])
        self.db.insert({"id": 16, "name": "My GROUP"}, self.db.tables["UserGroup"])

        payload = {
            "group": 16,
            "user": 14
        }

        response = self.application.post('/user/update_user_group_assignment',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        assignments = self.db.get(self.db.tables["UserGroupAssignment"])

        self.assertEqual(200, response.status_code)
        self.assertEqual(len(assignments), 2)
        self.assertEqual(assignments[1].group_id, 16)

    @BaseCase.login
    @BaseCase.grant_access("/user/update_user_group_assignment")
    def test_ok_with_existing_assignment(self, token):
        self.db.insert({"id": 14, "email": "myemail@test.lu", "password": "MySecret2!", "is_admin": 0},
                       self.db.tables["User"])
        self.db.insert({"id": 16, "name": "My GROUP"}, self.db.tables["UserGroup"])
        self.db.insert({"id": 17, "name": "My SECOND GROUP"}, self.db.tables["UserGroup"])
        self.db.insert({"group_id": 16, "user_id": 14}, self.db.tables["UserGroupAssignment"])

        payload = {
            "group": 17,
            "user": 14
        }

        response = self.application.post('/user/update_user_group_assignment',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        assignments = self.db.get(self.db.tables["UserGroupAssignment"])

        self.assertEqual(200, response.status_code)
        self.assertEqual(len(assignments), 2)
        self.assertEqual(assignments[1].group_id, 17)

    @BaseCase.login
    @BaseCase.grant_access("/user/update_user_group_assignment")
    def test_ko_unexisting_user(self, token):
        self.db.insert({"id": 16, "name": "My GROUP"}, self.db.tables["UserGroup"])

        payload = {
            "group": 17,
            "user": 14
        }

        response = self.application.post('/user/update_user_group_assignment',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        assignments = self.db.get(self.db.tables["UserGroupAssignment"])

        self.assertEqual("500 Object not found : user", response.status)
        self.assertEqual(len(assignments), 1)

    @BaseCase.login
    @BaseCase.grant_access("/user/update_user_group_assignment")
    def test_ko_unexisting_group(self, token):
        self.db.insert({"id": 14, "email": "myemail@test.lu", "password": "MySecret2!", "is_admin": 0},
                       self.db.tables["User"])

        payload = {
            "group": 17,
            "user": 14
        }

        response = self.application.post('/user/update_user_group_assignment',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        assignments = self.db.get(self.db.tables["UserGroupAssignment"])

        self.assertEqual("500 Object not found : group", response.status)
        self.assertEqual(len(assignments), 1)
