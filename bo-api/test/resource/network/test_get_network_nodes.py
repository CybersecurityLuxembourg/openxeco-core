from test.BaseCase import BaseCase


class TestGetNetworkNodes(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        self.db.insert({"api_endpoint": "https://random.url/feed"}, self.db.tables["NetworkNode"])
        self.db.insert({"api_endpoint": "https://random.url/feed2"}, self.db.tables["NetworkNode"])

        response = self.application.get('/network/get_network_nodes',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)
        self.assertEqual([
            {"api_endpoint": "https://random.url/feed", "id": 1},
            {"api_endpoint": "https://random.url/feed2", "id": 2}
        ], response.json)
