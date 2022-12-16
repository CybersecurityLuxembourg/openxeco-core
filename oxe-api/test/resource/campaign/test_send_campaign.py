from unittest.mock import patch

from test.BaseCase import BaseCase


class TestSendCampaign(BaseCase):

    @BaseCase.login
    @BaseCase.grant_access("/campaign/send_campaign")
    @patch('resource.campaign.send_campaign.send_email')
    def test_ok(self, mock_send_mail, token):
        mock_send_mail.return_value = None

        payload = {
            "subject": "TEST",
            "addresses": ["test@cy.lu", "test2@cy.lu"],
            "body": "Mail content",
        }

        response = self.application.post('/campaign/send_campaign',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        communications = self.db.get(self.db.tables["Campaign"])

        print(response.status)

        self.assertEqual(200, response.status_code)
        self.assertEqual(len(communications), 1)
