from unittest.mock import patch

from test.BaseCase import BaseCase


class TestSendCampaign(BaseCase):

    @BaseCase.login
    @BaseCase.grant_access("/campaign/send_campaign")
    @patch('resource.campaign.send_campaign.send_email')
    def test_ko_not_found(self, mock_send_mail, token):
        mock_send_mail.return_value = None

        payload = {
            "id": 1,
        }

        response = self.application.post('/campaign/send_campaign',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual("422 Object not found : Campaign", response.status)
