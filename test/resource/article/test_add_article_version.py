from test.BaseCase import BaseCase


class TestAddArticleVersion(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        self.db.insert({"id": 1, "title": "My article"}, self.db.tables["Article"])

        payload = {
            "name": "Version 1",
            "article_id": 1
        }

        response = self.application.post('/article/add_article_version',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        article_versions = self.db.get(self.db.tables["ArticleVersion"], {"id": 1})

        self.assertEqual(200, response.status_code)
        self.assertEqual(len(article_versions), 1)
        self.assertEqual(article_versions[0].is_main, False)
        self.assertEqual(article_versions[0].name, "Version 1")

    @BaseCase.login
    def test_ko_unexisting_article_id(self, token):
        self.db.insert({"id": 1, "title": "My article"}, self.db.tables["Article"])

        payload = {
            "name": "Version 1",
            "article_id": 2
        }

        response = self.application.post('/article/add_article_version',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        article_versions = self.db.get(self.db.tables["ArticleVersion"])

        self.assertEqual("422 the provided article does not exist", response.status)
        self.assertEqual(len(article_versions), 0)
