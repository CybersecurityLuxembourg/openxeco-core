from test.BaseCase import BaseCase


class TestGetUpdateArticleVersionLogs(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        self.db.insert({"id": 1, "title": "TITLE"}, self.db.tables["Article"])
        self.db.insert({"id": 2, "article_id": 1, "name": "VERSION 0", "is_main": 1}, self.db.tables["ArticleVersion"])
        self.db.insert({
            "request_method": "POST",
            "request": "/article/update_article_version_content",
            "params": '{"article_version_id": 2, "other": "other"}',
            'sys_date': '2021-01-26T11:26:13',
            "status_code": 200,
        }, self.db.tables["Log"])
        self.db.insert({
            "request_method": "POST",
            "request": "/article/update_article_version_content",
            "params": '{"article_version_id": 2}',
            'sys_date': '2021-01-26T11:26:13',
            "status_code": 200,
        }, self.db.tables["Log"])
        self.db.insert({
            "request_method": "POST",
            "request": "/article/update_article_version_content",
            "params": '{"article_version_id": 2}',
            'sys_date': '2021-01-26T11:26:13',
            "status_code": 500,
        }, self.db.tables["Log"])
        self.db.insert({
            "request_method": "POST",
            "request": "/article/update_article_version_content",
            "params": '{"article_version_id": 25}',
            'sys_date': '2021-01-26T11:26:13',
            "status_code": 500,
        }, self.db.tables["Log"])
        self.db.insert({
            "request_method": "POST",
            "request": "/article/other_resource",
            "params": '{"article_version_id": 2}',
            'sys_date': '2021-01-26T11:26:13',
            "status_code": 500,
        }, self.db.tables["Log"])

        response = self.application.get('/log/get_update_article_version_logs/2',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)
        self.assertEqual(len(response.json), 2)
        self.assertEqual([
            {
                'id': 2,
                'params': '{"article_version_id": 2, "other": "other"}',
                'request': '/article/update_article_version_content',
                'request_method': 'POST',
                'status_code': 200,
                'status_description': None,
                'sys_date': '2021-01-26T11:26:13',
                'user_id': None
            },
            {
                'id': 3,
                'params': '{"article_version_id": 2}',
                'request': '/article/update_article_version_content',
                'request_method': 'POST',
                'status_code': 200,
                'status_description': None,
                'sys_date': '2021-01-26T11:26:13',
                'user_id': None
            }], response.json)

    @BaseCase.login
    def test_ko_get_unexisting_article_version(self, token):
        response = self.application.get('/log/get_update_article_version_logs/2',
                                        headers=self.get_standard_header(token))

        self.assertEqual("500 Object not found", response.status)