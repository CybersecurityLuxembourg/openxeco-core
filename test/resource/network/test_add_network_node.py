from test.BaseCase import BaseCase
from utils.serializer import Serializer


class TestAddNetworkNode(BaseCase):

    @BaseCase.login
    @BaseCase.grant_access("/network/add_network_node")
    def test_ok(self, token):

        payload = {"api_endpoint": "https://api.random.url/"}

        response = self.application.post('/network/add_network_node',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        nodes = self.db.get(self.db.tables["NetworkNode"])

        self.assertEqual(200, response.status_code)
        self.assertEqual(len(nodes), 1)
        self.assertEqual(
            Serializer.serialize(nodes[0], self.db.tables["NetworkNode"]),
            {"api_endpoint": "https://api.random.url/", 'id': 1}
        )
