import json

from test.BaseCase import BaseCase
from unittest.mock import patch


class TestAddPublicRequest(BaseCase):

    @patch('resource.public.add_public_request.send_email')
    def test_ok(self, mock_send_mail):
        mock_send_mail.return_value = None

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
        mock_send_mail.assert_called_once()

    @patch('resource.public.add_public_request.send_email')
    def test_ok_with_parameters(self, mock_send_mail):
        mock_send_mail.return_value = None

        payload = {
            "full_name": "My Full Name",
            "email": "test@example.com",
            "message": "Hi guys!",
            "parameters": {
                "email": "wrong email",
                "other": "other value"
            }
        }

        response = self.application.post('/public/add_public_request',
                                         headers={"Origin": "localhost"},
                                         json=payload)

        requests = self.db.get(self.db.tables["UserRequest"])

        self.assertEqual(200, response.status_code)
        self.assertEqual(len(requests), 1)
        self.assertDictEqual(json.loads(requests[0].data), {
            "email": "test@example.com",
            "full_name": "My Full Name",
            "other": "other value"
        })
        mock_send_mail.assert_called_once()
