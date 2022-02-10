from test.BaseCase import BaseCase


class TestGetUsers(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        self.db.insert({"email": "email1", "password": "pass1"}, self.db.tables["User"])
        self.db.insert({"email": "email2", "password": "pass2"}, self.db.tables["User"])

        response = self.application.get('/user/get_users',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)
        # 3 because there is the user created in the init of the unittest
        self.assertEqual(response.json, {
            'pagination': {
                'page': 1,
                'pages': 1,
                'per_page': 50,
                'total': 3
            },
            'items': [
                {'id': 2, 'email': 'email1', 'is_admin': 0, 'is_active': 0, 'accept_communication': 1},
                {'id': 3, 'email': 'email2', 'is_admin': 0, 'is_active': 0, 'accept_communication': 1},
                {'id': 1, 'email': 'test@openxeco.org', 'is_admin': 1, 'is_active': 1, 'accept_communication': 1},
            ]
        })

    @BaseCase.login
    def test_ok_admin_only(self, token):
        self.db.insert({"email": "email1", "password": "pass1", "is_admin": 0}, self.db.tables["User"])
        self.db.insert({"email": "email2", "password": "pass2", "is_admin": 1}, self.db.tables["User"])

        response = self.application.get('/user/get_users?admin_only=true',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)
        # 2 because there is the User need to authenticate
        self.assertEqual(response.json, {
            'pagination': {
                'page': 1,
                'pages': 1,
                'per_page': 50,
                'total': 2
            },
            'items': [
                {'id': 3, 'email': 'email2', 'is_admin': 1, 'is_active': 0, 'accept_communication': 1},
                {'id': 1, 'email': 'test@openxeco.org', 'is_admin': 1, 'is_active': 1, 'accept_communication': 1},
            ]
        })
