import os
from unittest.mock import patch

from flask_bcrypt import check_password_hash
from sqlalchemy.exc import IntegrityError

from test.BaseCase import BaseCase


class TestAddUser(BaseCase):

    @BaseCase.login
    @BaseCase.grant_access("/user/add_user")
    @patch('resource.user.add_user.send_email')
    def test_ok(self, mock_send_mail, token):
        mock_send_mail.return_value = None

        os.environ['JWT_SECRET_KEY'] = "test_key"

        self.db.insert({"email": "myemail@test.lu", "password": "MySecret2!"}, self.db.tables["User"])

        payload = {"email": "myemail2@test.lu", "password": "MySecret2!"}

        response = self.application.post('/user/add_user',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        users = self.db.get(self.db.tables["User"], {"email": "myemail2@test.lu"})

        self.assertEqual(200, response.status_code)
        self.assertEqual(self.db.get_count(self.db.tables["User"]), 3)

        self.assertEqual(len(users), 1)
        self.assertTrue(check_password_hash(users[0].password, "MySecret2!"))

        self.assertEqual(mock_send_mail.call_count, 1)

    @BaseCase.login
    @BaseCase.grant_access("/user/add_user")
    def test_bad_mail_format(self, token):
        self.db.insert({"email": "myemail@test.lu", "password": "MySecret"}, self.db.tables["User"])

        payload = {"email": "email-test.lu", "password": "MySecret2!"}

        response = self.application.post('/user/add_user',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual("422 The email does not have the right format", response.status)
        self.assertEqual(self.db.get_count(self.db.tables["User"]), 2)

    @BaseCase.login
    @BaseCase.grant_access("/user/add_user")
    def test_bad_password_format(self, token):
        self.db.insert({"email": "myemail@test.lu", "password": "MyWrongSecretSecret"}, self.db.tables["User"])

        payload = {"email": "myemail2@test.lu", "password": "MySecret2"}

        response = self.application.post('/user/add_user',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual("422 The password does not have the right format", response.status)
        self.assertEqual(self.db.get_count(self.db.tables["User"]), 2)

    @BaseCase.login
    @BaseCase.grant_access("/user/add_user")
    def test_duplicate_error(self, token):
        self.db.insert({"email": "myemail@test.lu", "password": "MyWrongSecretSecret"}, self.db.tables["User"])

        payload = {"email": "myemail@test.lu", "password": "MySecret2!"}

        response = self.application.post('/user/add_user',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual("422 This user is already existing", response.status)

    @BaseCase.login
    @BaseCase.grant_access("/user/add_user")
    @patch('resource.user.add_user.send_email')
    @patch('db.db.DB.insert')
    def test_force_integrity_error_out_of_duplicate(self, mock_db_insert, mock_send_mail, token):
        mock_send_mail.return_value = None
        mock_db_insert.side_effect = [IntegrityError(None, None, None), None]

        payload = {"email": "myemail@test.lu", "password": "MySecret2!"}

        response = self.application.post('/user/add_user',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual(500, response.status_code)
