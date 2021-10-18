from test.BaseCase import BaseCase


class TestGetRssFeeds(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        self.db.insert({"url": "https://random.url/feed"}, self.db.tables["RssFeed"])
        self.db.insert({"url": "https://random.url/feed2"}, self.db.tables["RssFeed"])

        response = self.application.get('/rss/get_rss_feeds',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)
        self.assertEqual([
            {"url": "https://random.url/feed"},
            {"url": "https://random.url/feed2"}
        ], response.json)
