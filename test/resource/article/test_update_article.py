from test.BaseCase import BaseCase
import datetime


class TestUpdateArticle(BaseCase):

    @BaseCase.login
    @BaseCase.grant_access("/article/update_article")
    def test_ok(self, token):
        self.db.insert({
            "id": 1,
            "title": "TITLE"
        }, self.db.tables["Article"])

        payload = {
            "id": 1,
            "title": "My new title",
            "publication_date": (datetime.date.today() - datetime.timedelta(days=1)).strftime("%Y-%m-%d"),
            "type": "EVENT"
        }

        response = self.application.post('/article/update_article',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        articles = self.db.get(self.db.tables["Article"])

        self.assertEqual(200, response.status_code)
        self.assertEqual(len(articles), 1)
        self.assertEqual(articles[0].title, "My new title")
        self.assertEqual(articles[0].publication_date,
                         datetime.date.today() - datetime.timedelta(days=1))
