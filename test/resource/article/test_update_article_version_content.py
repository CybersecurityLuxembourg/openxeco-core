from test.BaseCase import BaseCase


class TestUpdateArticleVersionContent(BaseCase):

    @BaseCase.login
    @BaseCase.grant_access("/article/update_article_version_content")
    def test_ok(self, token):
        self.db.insert({"id": 1, "title": "TITLE"}, self.db.tables["Article"])
        self.db.insert({"id": 1, "article_id": 1, "name": "VERSION 0"}, self.db.tables["ArticleVersion"])
        self.db.insert({"id": 1, "article_version_id": 1, "position": 1, "type": "TITLE1", "content": "title 1"},
                       self.db.tables["ArticleBox"])
        self.db.insert({"id": 2, "article_version_id": 1, "position": 2, "type": "TITLE2", "content": "title 2"},
                       self.db.tables["ArticleBox"])

        payload = {
            "article_version_id": 1,
            "content": [
                {
                    "type": "PARAGRAPH",
                    "content": "<p>my p</p>"
                },
                {
                    "type": "IMAGE",
                    "content": "42"
                },
                {
                    "type": "TITLE3",
                    "content": "My title 3"
                },
            ]
        }

        response = self.application.post('/article/update_article_version_content',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        article_boxes = self.db.get(self.db.tables["ArticleBox"])

        self.assertEqual(200, response.status_code)
        self.assertEqual(len(article_boxes), 3)

        self.assertEqual(article_boxes[0].type, "PARAGRAPH")
        self.assertEqual(article_boxes[0].content, "<p>my p</p>")
        self.assertEqual(article_boxes[0].position, 1)
        self.assertEqual(article_boxes[0].id, 3)

        self.assertEqual(article_boxes[1].type, "IMAGE")
        self.assertEqual(article_boxes[1].content, "42")
        self.assertEqual(article_boxes[1].position, 2)
        self.assertEqual(article_boxes[1].id, 4)

        self.assertEqual(article_boxes[2].type, "TITLE3")
        self.assertEqual(article_boxes[2].content, "My title 3")
        self.assertEqual(article_boxes[2].position, 3)
        self.assertEqual(article_boxes[2].id, 5)

    @BaseCase.login
    @BaseCase.grant_access("/article/update_article_version_content")
    def test_ko_no_article_version_id(self, token):

        payload = {
            "article_version_id": 1,
            "content": [
                {
                    "type": "PARAGRAPH",
                    "content": "<p>my p</p>"
                },
                {
                    "type": "IMAGE",
                    "content": "42"
                },
                {
                    "type": "TITLE3",
                    "content": "My title 3"
                },
            ]
        }

        response = self.application.post('/article/update_article_version_content',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual("422 The provided article version ID does not exist", response.status)

    @BaseCase.login
    @BaseCase.grant_access("/article/update_article_version_content")
    def test_ko_wrong_type(self, token):
        self.db.insert({"id": 1, "title": "TITLE"}, self.db.tables["Article"])
        self.db.insert({"id": 1, "article_id": 1, "name": "VERSION 0"}, self.db.tables["ArticleVersion"])
        self.db.insert({"id": 1, "article_version_id": 1, "position": 1, "type": "TITLE1", "content": "title 1"},
                       self.db.tables["ArticleBox"])
        self.db.insert({"id": 2, "article_version_id": 1, "position": 2, "type": "TITLE2", "content": "title 2"},
                       self.db.tables["ArticleBox"])

        payload = {
            "article_version_id": 1,
            "content": [
                {
                    "type": "PARAGRAPH",
                    "content": "<p>my p</p>"
                },
                {
                    "type": "IMAGE",
                    "content": "42"
                },
                {
                    "type": "WRONGTYPE",
                    "content": "My title 3"
                },
            ]
        }

        response = self.application.post('/article/update_article_version_content',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        article_boxes = self.db.get(self.db.tables["ArticleBox"])

        self.assertEqual("422 Wrong content type found: 'WRONGTYPE'", response.status)
        self.assertEqual(len(article_boxes), 2)
