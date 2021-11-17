from test.BaseCase import BaseCase


class TestDeleteNetworkNode(BaseCase):

    @BaseCase.login
    @BaseCase.grant_access("/network/delete_network_node")
    def test_ok(self, token):
        self.db.insert({
            "api_endpoint": "https://random.url/feed",
        }, self.db.tables["NetworkNode"])

        payload = {
            "id": 1,
        }

        response = self.application.post('/network/delete_network_node',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        feeds = self.db.get(self.db.tables["NetworkNode"])

        self.assertEqual(200, response.status_code)
        self.assertEqual(len(feeds), 0)

    @BaseCase.login
    @BaseCase.grant_access("/network/delete_network_node")
    def test_delete_unexisting(self, token):
        payload = {
            "id": 1,
        }

        response = self.application.post('/network/delete_network_node',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual("422 Object not found", response.status)