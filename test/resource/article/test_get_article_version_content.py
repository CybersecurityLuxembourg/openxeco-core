from test.BaseCase import BaseCase


class TestGetArticleVersionContent(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        self.db.insert({"id": 1, "title": "TITLE"}, self.db.tables["Article"])
        self.db.insert({"id": 2, "article_id": 1, "name": "VERSION 0", "is_main": 1}, self.db.tables["ArticleVersion"])
        self.db.insert({"id": 3, "article_version_id": 2, "position": 1, "type": "TITLE1", "content": "Text"},
                       self.db.tables["ArticleBox"])
        self.db.insert({"id": 4, "article_version_id": 2, "position": 2, "type": "TITLE2", "content": "Text2"},
                       self.db.tables["ArticleBox"])

        response = self.application.get('/article/get_article_version_content/2',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)
        self.assertEqual([
            {
                'article_version_id': 2,
                'content': 'Text',
                'id': 3,
                'position': 1,
                'type': 'TITLE1'
            },
            {
                'article_version_id': 2,
                'content': 'Text2',
                'id': 4,
                'position': 2,
                'type': 'TITLE2'
            }
        ], response.json)

    @BaseCase.login
    def test_ko_get_unexisting_article_version(self, token):
        response = self.application.get('/article/get_article_version_content/2',
                                        headers=self.get_standard_header(token))

        self.assertEqual("422 Object not found", response.status)
