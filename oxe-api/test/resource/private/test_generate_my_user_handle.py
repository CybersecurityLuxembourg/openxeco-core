from unittest.mock import patch
from unittest import mock

from test.BaseCase import BaseCase


class TestGenerateMyUserHandle(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        with patch("resource.private.generate_my_user_handle.open",
                   mock.mock_open(read_data="word1\nword2\nword3\nword4\nword5"), create=True):

            response = self.application.post('/private/generate_my_user_handle',
                                             headers=self.get_standard_post_header(token))

            user = self.db.get(self.db.tables["User"], {"id": 1})

            self.assertEqual(200, response.status_code)
            self.assertEqual(len(user), 1)
            self.assertNotEqual(user[0].handle, None)
            self.assertTrue(len(user[0].handle.split("-")) >= 4)
