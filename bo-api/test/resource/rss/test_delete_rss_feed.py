from test.BaseCase import BaseCase


class TestDeleteRssFeed(BaseCase):

    @BaseCase.login
    @BaseCase.grant_access("/rss/delete_rss_feed")
    def test_ok(self, token):
        self.db.insert({
            "url": "https://random.url/feed",
        }, self.db.tables["RssFeed"])

        payload = {
            "url": "https://random.url/feed",
        }

        response = self.application.post('/rss/delete_rss_feed',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        feeds = self.db.get(self.db.tables["RssFeed"])

        self.assertEqual(200, response.status_code)
        self.assertEqual(len(feeds), 0)

    @BaseCase.login
    @BaseCase.grant_access("/rss/delete_rss_feed")
    def test_delete_unexisting(self, token):
        payload = {
            "url": "https://random.url/feed",
        }

        response = self.application.post('/rss/delete_rss_feed',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual("422 Object not found", response.status)