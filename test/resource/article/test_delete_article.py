from test.BaseCase import BaseCase


class TestDeleteArticle(BaseCase):

    @BaseCase.login
    @BaseCase.grant_access("/article/delete_article")
    def test_ok(self, token):
        self.db.insert({"id": 1, "title": "TITLE"}, self.db.tables["Article"])
        self.db.insert({"id": 1, "article_id": 1, "name": "VERSION 0"}, self.db.tables["ArticleVersion"])

        payload = {
            "id": 1,
        }

        response = self.application.post('/article/delete_article',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual(200, response.status_code)
        self.assertEqual(self.db.get_count(self.db.tables["Article"]), 0)
        self.assertEqual(self.db.get_count(self.db.tables["ArticleVersion"]), 0)

    @BaseCase.login
    @BaseCase.grant_access("/article/delete_article")
    def test_delete_unexisting(self, token):
        payload = {
            "id": 1,
        }

        response = self.application.post('/article/delete_article',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual("422 Object not found", response.status)
