from test.BaseCase import BaseCase


class TestGetRssFeeds(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        self.db.insert({"id": 2, "name": "My Entity"}, self.db.tables["Entity"])
        self.db.insert({"entity_id": 2, "url": "https://random.url/feed"}, self.db.tables["RssFeed"])
        self.db.insert({"url": "https://random.url/feed2"}, self.db.tables["RssFeed"])

        response = self.application.get('/rss/get_rss_feeds',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)
        self.assertEqual([
            {'entity_id': None, "url": "https://random.url/feed2"},
            {'entity_id': 2, "url": "https://random.url/feed"},
        ], response.json)
