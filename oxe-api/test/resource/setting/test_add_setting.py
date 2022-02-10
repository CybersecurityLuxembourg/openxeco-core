from test.BaseCase import BaseCase


class TestAddSetting(BaseCase):

    @BaseCase.login
    @BaseCase.grant_access("/setting/add_setting")
    def test_ok(self, token):

        payload = {
            "property": "PROP",
            "value": "VALUE",
        }

        response = self.application.post('/setting/add_setting',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual(200, response.status_code)
        self.assertEqual(self.db.get_count(self.db.tables["Setting"]), 1)

    @BaseCase.login
    @BaseCase.grant_access("/setting/add_setting")
    def test_ko_already_exists(self, token):
        self.db.insert({"property": "PROP", "value": "VALUE"}, self.db.tables["Setting"])

        payload = {
            "property": "PROP",
            "value": "VALUE",
        }

        response = self.application.post('/setting/add_setting',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual("422 Provided setting already exists", response.status)
        self.assertEqual(self.db.get_count(self.db.tables["Setting"]), 1)
