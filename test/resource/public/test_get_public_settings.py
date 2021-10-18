from test.BaseCase import BaseCase


class TestGetPublicSettings(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        self.db.insert({
            "property": "My setting",
            "value": "My value",
        }, self.db.tables["Setting"])

        response = self.application.get('/public/get_public_settings',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)
        self.assertEqual(response.json, [{
            "property": "My setting",
            "value": "My value",
        }])
