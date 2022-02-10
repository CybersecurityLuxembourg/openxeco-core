from test.BaseCase import BaseCase


class TestGetNodeInformation(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        response = self.application.get('/network/get_node_information',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)
        self.assertEqual({
            'email_address': None,
            'phone_number': None,
            'postal_address': None,
            'project_name': None,
            'version': '1.7'
        }, response.json)

    @BaseCase.login
    def test_ok_with_info(self, token):
        self.db.insert({"property": "PROJECT_NAME", "value": "my project"}, self.db.tables["Setting"])
        self.db.insert({"property": "EMAIL_ADDRESS", "value": "my email"}, self.db.tables["Setting"])
        self.db.insert({"property": "PHONE_NUMBER", "value": "my phone"}, self.db.tables["Setting"])
        self.db.insert({"property": "POSTAL_ADDRESS", "value": "my address"}, self.db.tables["Setting"])

        response = self.application.get('/network/get_node_information',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)
        self.assertEqual({
            'email_address': "my email",
            'phone_number': "my phone",
            'postal_address': "my address",
            'project_name': "my project",
            'version': '1.7'
        }, response.json)
