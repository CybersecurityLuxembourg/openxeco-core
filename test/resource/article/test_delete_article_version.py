from test.BaseCase import BaseCase


class TestDeleteArticleVersion(BaseCase):

    @BaseCase.login
    @BaseCase.grant_access("/article/delete_article_version")
    def test_ok(self, token):
        self.db.insert({"id": 1, "title": "TITLE"}, self.db.tables["Article"])
        self.db.insert({"id": 1, "article_id": 1, "name": "VERSION 0"}, self.db.tables["ArticleVersion"])

        payload = {
            "id": 1,
        }

        response = self.application.post('/article/delete_article_version',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual(200, response.status_code)
        self.assertEqual(self.db.get_count(self.db.tables["Article"]), 1)
        self.assertEqual(self.db.get_count(self.db.tables["ArticleVersion"]), 0)

    @BaseCase.login
    @BaseCase.grant_access("/article/delete_article_version")
    def test_delete_main_version(self, token):
        self.db.insert({"id": 1, "title": "TITLE"}, self.db.tables["Article"])
        self.db.insert({"id": 1, "article_id": 1, "name": "VERSION 0", "is_main": 1}, self.db.tables["ArticleVersion"])

        payload = {
            "id": 1,
        }

        response = self.application.post('/article/delete_article_version',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual("422 Cannot delete a version defined as a main version", response.status)

    @BaseCase.login
    @BaseCase.grant_access("/article/delete_article_version")
    def test_delete_unexisting(self, token):
        payload = {
            "id": 1,
        }

        response = self.application.post('/article/delete_article_version',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual("422 Object not found", response.status)
