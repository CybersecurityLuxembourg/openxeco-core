from test.BaseCase import BaseCase


class TestSetArticleVersionAsMain(BaseCase):

    @BaseCase.login
    @BaseCase.grant_access("/article/set_article_version_as_main")
    def test_ok(self, token):

        self.db.insert({"id": 1, "title": "TITLE"}, self.db.tables["Article"])
        self.db.insert({"id": 2, "article_id": 1, "name": "VERSION 0", "is_main": 1}, self.db.tables["ArticleVersion"])
        self.db.insert({"id": 3, "article_id": 1, "name": "VERSION 1", "is_main": 0}, self.db.tables["ArticleVersion"])

        payload = {
            "id": 3,
        }

        response = self.application.post('/article/set_article_version_as_main',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        article_version_zero = self.db.get(self.db.tables["ArticleVersion"], {"id": 2})
        article_version_one = self.db.get(self.db.tables["ArticleVersion"], {"id": 3})

        self.assertEqual(200, response.status_code)

        self.assertEqual(len(article_version_zero), 1)
        self.assertEqual(article_version_zero[0].is_main, 0)

        self.assertEqual(len(article_version_one), 1)
        self.assertEqual(article_version_one[0].is_main, 1)

    @BaseCase.login
    @BaseCase.grant_access("/article/set_article_version_as_main")
    def test_ko(self, token):
        payload = {
            "id": 3,
        }

        response = self.application.post('/article/set_article_version_as_main',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual("422 The provided article version ID does not exist", response.status)