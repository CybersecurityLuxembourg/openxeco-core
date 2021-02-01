from test.BaseCase import BaseCase


class TestGetArticleVersions(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        self.db.insert({"id": 1, "title": "TITLE"}, self.db.tables["Article"])
        self.db.insert({"id": 2, "article_id": 1, "name": "VERSION 0", "is_main": 1}, self.db.tables["ArticleVersion"])
        self.db.insert({"id": 3, "article_id": 1, "name": "VERSION 1", "is_main": 0}, self.db.tables["ArticleVersion"])

        response = self.application.get('/article/get_article_versions/1',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)
        self.assertEqual([
            {'article_id': 1, 'id': 2, 'is_main': 1, 'name': 'VERSION 0'},
            {'article_id': 1, 'id': 3, 'is_main': 0, 'name': 'VERSION 1'}
        ], response.json)

    @BaseCase.login
    def test_ko_get_unexisting_article_version(self, token):
        response = self.application.get('/article/get_article_versions/1',
                                        headers=self.get_standard_header(token))

        self.assertEqual("500 Object not found", response.status)
