from test.BaseCase import BaseCase
from datetime import datetime, timedelta


class TestGetLogs(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        time = (datetime.now() - timedelta(1)).isoformat().split('.')[0]

        self.db.insert({
            "request_method": "POST",
            "request": "/article/update_article_version_content",
            "params": '{"article_version_id": 25}',
            'sys_date': time,
            "status_code": 500,
        }, self.db.tables["Log"])
        self.db.insert({
            "request_method": "POST",
            "request": "/article/other_resource",
            "params": '{"article_version_id": 2}',
            'sys_date': time,
            "status_code": 500,
        }, self.db.tables["Log"])

        response = self.application.get('/log/get_logs?resource=other_resource',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)
        self.assertEqual(len(response.json), 1)
        self.assertEqual([
            {
                "id": 3,
                "request_method": "POST",
                "request": "/article/other_resource",
                "params": '{"article_version_id": 2}',
                'sys_date': time,
                "status_code": 500,
                'status_description': None,
                'user_id': None
            }
        ], response.json)
