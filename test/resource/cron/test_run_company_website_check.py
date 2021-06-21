from unittest.mock import patch, call

from requests import Response

from test.BaseCase import BaseCase


class TestRunCompanyWebsiteCheck(BaseCase):

    @BaseCase.login
    @BaseCase.grant_access("/cron/run_company_website_check")
    @patch('resource.cron.run_company_website_check.requests.head')
    def test_ok(self, mock_head, token):
        self.db.insert({"id": 1, "name": "Company 1", "website": "http://fake-website.com"}, self.db.tables["Company"])
        self.db.insert({"id": 2, "name": "Company 2", "website": "fake-website.com"}, self.db.tables["Company"])

        response = Response()
        response.status_code = 200

        mock_head.side_effect = [
            response,
            response
        ]

        response = self.application.post('/cron/run_company_website_check',
                                         headers=self.get_standard_post_header(token))

        data_controls = self.db.get(self.db.tables["DataControl"])

        self.assertEqual(mock_head.call_args_list[0], call("http://fake-website.com"))
        self.assertEqual(mock_head.call_args_list[1], call("https://fake-website.com"))
        self.assertEqual(mock_head.call_count, 2)
        self.assertEqual(len(data_controls), 0)
        self.assertEqual(200, response.status_code)

    @BaseCase.login
    @BaseCase.grant_access("/cron/run_company_website_check")
    def test_ko_wrong_website_format(self, token):
        self.db.insert({"id": 1, "name": "Company 1", "website": ""}, self.db.tables["Company"])

        response = self.application.post('/cron/run_company_website_check',
                                         headers=self.get_standard_post_header(token))

        data_controls = self.db.get(self.db.tables["DataControl"])

        self.assertEqual(len(data_controls), 1)
        self.assertEqual(data_controls[0].value, "The website of <COMPANY:1> seems unreachable")
        self.assertEqual(200, response.status_code)

    @BaseCase.login
    @BaseCase.grant_access("/cron/run_company_website_check")
    @patch('resource.cron.run_company_website_check.requests.head')
    def test_ko_500_response(self, mock_head, token):
        self.db.insert({"id": 1, "name": "Company 1", "website": "http://correct-site.com"}, self.db.tables["Company"])

        response = Response()
        response.status_code = 500

        mock_head.side_effect = [
            response,
        ]

        response = self.application.post('/cron/run_company_website_check',
                                         headers=self.get_standard_post_header(token))

        data_controls = self.db.get(self.db.tables["DataControl"])

        self.assertEqual(mock_head.call_args_list[0], call("http://correct-site.com"))
        self.assertEqual(mock_head.call_count, 1)
        self.assertEqual(len(data_controls), 1)
        self.assertEqual(data_controls[0].value, f"The website of <COMPANY:1> returned code 500")
        self.assertEqual(200, response.status_code)