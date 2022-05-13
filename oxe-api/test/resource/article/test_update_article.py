import datetime

from test.BaseCase import BaseCase


class TestUpdateArticle(BaseCase):

    @BaseCase.login
    @BaseCase.grant_access("/article/update_article")
    def test_ok(self, token):
        time = datetime.datetime.now() - datetime.timedelta(days=1)

        self.db.insert({
            "id": 1,
            "title": "TITLE"
        }, self.db.tables["Article"])

        payload = {
            "id": 1,
            "title": "My new title",
            "publication_date": time.strftime("%Y-%m-%dT%H:%M:%S"),
            "type": "EVENT"
        }

        response = self.application.post('/article/update_article',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        articles = self.db.get(self.db.tables["Article"])

        self.assertEqual(200, response.status_code)
        self.assertEqual(len(articles), 1)
        self.assertEqual(articles[0].title, "My new title")
        self.assertEqual(articles[0].publication_date.strftime("%Y-%m-%dT%H:%M:%S"), time.strftime("%Y-%m-%dT%H:%M:%S"))
