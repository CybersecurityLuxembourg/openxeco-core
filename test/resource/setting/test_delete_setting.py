from test.BaseCase import BaseCase


class TestDeleteAddress(BaseCase):

    @BaseCase.login
    @BaseCase.grant_access("/setting/delete_setting")
    def test_ok(self, token):
        self.db.insert({"property": "PROP", "value": "VALUE"}, self.db.tables["Setting"])

        payload = {
            "property": "PROP",
        }

        response = self.application.post('/setting/delete_setting',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual(200, response.status_code)
        self.assertEqual(self.db.get_count(self.db.tables["Setting"]), 0)

    @BaseCase.login
    @BaseCase.grant_access("/setting/delete_setting")
    def test_delete_unexisting(self, token):
        payload = {
            "property": "PROP"
        }

        response = self.application.post('/setting/delete_setting',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual("422 Object not found", response.status)
