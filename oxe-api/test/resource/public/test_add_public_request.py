import json

from test.BaseCase import BaseCase


class TestAddPublicRequest(BaseCase):

    def test_ok(self):

        payload = {
            "full_name": "My Full Name",
            "email": "test@example.com",
            "message": "Hi guys!"
        }

        response = self.application.post('/public/add_public_request',
                                         headers={"Origin": "localhost"},
                                         json=payload)

        requests = self.db.get(self.db.tables["UserRequest"])

        self.assertEqual(200, response.status_code)
        self.assertEqual(len(requests), 1)
        self.assertEqual(requests[0].user_id, None)
        self.assertEqual(requests[0].entity_id, None)
        self.assertEqual(requests[0].type, "CONTACT FORM")
        self.assertEqual(requests[0].request, "Hi guys!")
        self.assertDictEqual(json.loads(requests[0].data), {"email": "test@example.com", "full_name": "My Full Name"})
