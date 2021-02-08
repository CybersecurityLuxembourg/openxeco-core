from test.BaseCase import BaseCase


class TestCopyArticleVersion(BaseCase):

    @BaseCase.login
    @BaseCase.grant_access("/article/copy_article_version")
    def test_ok(self, token):
        self.db.insert({"id": 1, "title": "My article"}, self.db.tables["Article"])
        self.db.insert({"id": 1, "article_id": 1, "name": "Version 0"}, self.db.tables["ArticleVersion"])
        self.db.insert({"id": 1, "article_version_id": 1, "position": 1, "type": "TITLE1", "content": "title 1"},
                       self.db.tables["ArticleBox"])
        self.db.insert({"id": 2, "article_version_id": 1, "position": 2, "type": "TITLE2", "content": "title 2"},
                       self.db.tables["ArticleBox"])

        payload = {
            "name": "Version 1",
            "article_version_id": 1
        }

        response = self.application.post('/article/copy_article_version',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        article_versions = self.db.get(self.db.tables["ArticleVersion"])
        article_boxes = self.db.get(self.db.tables["ArticleBox"], {"article_version_id": 2})

        self.assertEqual(200, response.status_code)
        self.assertEqual(len(article_versions), 2)
        self.assertEqual(article_versions[0].name, "Version 0")
        self.assertEqual(article_versions[1].name, "Version 1")

        self.assertEqual(len(article_boxes), 2)
        self.assertEqual(article_boxes[0].type, "TITLE1")
        self.assertEqual(article_boxes[0].content, "title 1")
        self.assertEqual(article_boxes[1].type, "TITLE2")
        self.assertEqual(article_boxes[1].content, "title 2")

    @BaseCase.login
    @BaseCase.grant_access("/article/copy_article_version")
    def test_ko_unexisting_article_id(self, token):

        payload = {
            "name": "Version 1",
            "article_version_id": 1
        }

        response = self.application.post('/article/copy_article_version',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        article_versions = self.db.get(self.db.tables["ArticleVersion"])

        self.assertEqual("422 The provided article version ID does not exist", response.status)
        self.assertEqual(len(article_versions), 0)
