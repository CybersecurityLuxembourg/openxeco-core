from unittest.mock import patch

from sqlalchemy.exc import IntegrityError

from test.BaseCase import BaseCase


class TestAddForm(BaseCase):

    @BaseCase.login
    @BaseCase.grant_access("/form/add_form")
    def test_ok(self, token):
        self.assertEqual(self.db.get_count(self.db.tables["Form"]), 0)

        payload = {
            "name": "FORM2",
        }

        response = self.application.post('/form/add_form',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual(200, response.status_code)
        self.assertEqual(self.db.get_count(self.db.tables["Form"]), 1)
