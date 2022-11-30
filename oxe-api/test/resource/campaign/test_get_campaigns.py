import datetime

from test.BaseCase import BaseCase


class TestGetCampaigns(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        time = datetime.datetime.strptime('01-22-2021', '%m-%d-%Y')

        self.db.insert({
            "id": 2,
            "subject": "My subject",
            "body": "My mail body",
            "sys_date": time
        }, self.db.tables["Campaign"])

        response = self.application.get('/campaign/get_campaigns',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)
        self.assertEqual({
            "pagination": {
                "page": 1,
                "pages": 1,
                "per_page": 50,
                "total": 1,
            },
            "items": [
                {
                    "id": 2,
                    "execution_date": None,
                    "name": None,
                    "status": "DRAFT",
                    "subject": "My subject",
                    "body": "My mail body",
                    "sys_date": str(time).replace(" ", "T"),
                    "template_id": None
                },
            ]
        }, response.json)
