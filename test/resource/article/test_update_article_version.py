from test.BaseCase import BaseCase


class TestUpdateArticle(BaseCase):

    @BaseCase.login
    @BaseCase.grant_access("/article/update_article_version")
    def test_ok(self, token):
        self.db.insert({"id": 1, "title": "TITLE"}, self.db.tables["Article"])
        self.db.insert({"id": 1, "article_id": 1, "name": "name"}, self.db.tables["ArticleVersion"])

        payload = {
            "id": 1,
            "name": "new name"
        }

        response = self.application.post('/article/update_article_version',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        article_versions = self.db.get(self.db.tables["ArticleVersion"])

        self.assertEqual(200, response.status_code)
        self.assertEqual(len(article_versions), 1)
        self.assertEqual(article_versions[0].name, "new name")
