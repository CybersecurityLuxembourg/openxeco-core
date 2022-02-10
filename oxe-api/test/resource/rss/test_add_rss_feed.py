import os
from unittest.mock import patch

from test.BaseCase import BaseCase
from utils.serializer import Serializer


class TestAddRssFeed(BaseCase):

    @BaseCase.login
    @BaseCase.grant_access("/rss/add_rss_feed")
    @patch('resource.media.add_image.IMAGE_FOLDER', os.path.join(os.path.dirname(os.path.realpath(__file__)),
                                                                 "test_add_image"))
    def test_ok(self, token):

        payload = {"url": "https://random.url/feed"}

        response = self.application.post('/rss/add_rss_feed',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)
        print(self.db.tables)
        feeds = self.db.get(self.db.tables["RssFeed"])

        self.assertEqual(200, response.status_code)
        self.assertEqual(len(feeds), 1)
        print(self.db.tables)
        self.assertEqual(Serializer.serialize(feeds[0], self.db.tables["RssFeed"]), {"url": "https://random.url/feed"})

    @BaseCase.login
    @BaseCase.grant_access("/rss/add_rss_feed")
    @patch('resource.media.add_image.IMAGE_FOLDER', "/unexisting/path")
    def test_ko_already_exist(self, token):

        self.db.insert({"url": "https://random.url/feed"}, self.db.tables["RssFeed"])

        payload = {"url": "https://random.url/feed"}

        response = self.application.post('/rss/add_rss_feed',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        feeds = self.db.get(self.db.tables["RssFeed"])

        self.assertEqual("422 Provided RSS feed already exists", response.status)
        self.assertEqual(len(feeds), 1)
