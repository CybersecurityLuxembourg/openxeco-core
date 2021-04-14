from test.BaseCase import BaseCase


class TestUpdateUser(BaseCase):

    @BaseCase.login
    @BaseCase.grant_access("/user/update_user")
    def test_ok(self, token):
        self.db.insert({
            "id": 14,
            "email": "myemail@test.lu",
            "password": "MySecret2!",
            "is_admin": 0,
        }, self.db.tables["User"])

        payload = {
            "id": 14,
            "is_admin": 1
        }

        response = self.application.post('/user/update_user',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        users = self.db.get(self.db.tables["User"], {"id": 14})

        self.assertEqual(200, response.status_code)
        self.assertEqual(len(users), 1)
        self.assertEqual(users[0].is_admin, 1)

    @BaseCase.login
    @BaseCase.grant_access("/user/update_user")
    def test_ko_password_param(self, token):
        self.db.insert({
            "id": 2,
            "email": "myemail@test.lu",
            "password": "MySecret2!",
            "is_admin": 0,
        }, self.db.tables["User"])

        payload = {
            "id": 2,
            "is_admin": 1,
            "password": "new pass"
        }

        response = self.application.post('/user/update_user',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        users = self.db.get(self.db.tables["User"], {"id": 2})

        self.assertEqual("422 Cannot modify this attribute: password", response.status)
        self.assertEqual(users[0].is_admin, 0)

    @BaseCase.login
    @BaseCase.grant_access("/user/update_user")
    def test_ko_email_param(self, token):
        self.db.insert({
            "id": 2,
            "email": "myemail@test.lu",
            "password": "MySecret2!",
            "is_admin": 0,
        }, self.db.tables["User"])

        payload = {
            "id": 2,
            "is_admin": 1,
            "email": "myemail@test.lu"
        }

        response = self.application.post('/user/update_user',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        users = self.db.get(self.db.tables["User"], {"id": 2})

        self.assertEqual("422 Cannot modify this attribute: email", response.status)
        self.assertEqual(users[0].is_admin, 0)
