from test.BaseCase import BaseCase


class TestAddArticle(BaseCase):

    @BaseCase.login
    def test_ok(self, token):

        title = "Article title with-dig1ts-and-letters"
        payload = {"title": title}

        response = self.application.post('/article/add_article',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        articles = self.db.get(self.db.tables["Article"])
        article_versions = self.db.get(self.db.tables["ArticleVersion"], {"id": articles[0].id})

        self.assertEqual(200, response.status_code)
        self.assertEqual(len(articles), 1)
        self.assertEqual(articles[0].title, title)
        self.assertEqual(articles[0].handle, "article-title-with-dig1ts-and-letters")

        self.assertEqual(len(article_versions), 1)
        self.assertEqual(article_versions[0].is_main, True)
        self.assertEqual(article_versions[0].name, "Version 0")
