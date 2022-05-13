import datetime
import os

import bs4

from test.BaseCase import BaseCase


class TestGetArticleContent(BaseCase):

    complete_article = [
        {
            "id": 1,
            "article_version_id": 2,
            "position": 1,
            "type": "TITLE1",
            "content": "title 1"
        },
        {
            "id": 2,
            "article_version_id": 2,
            "position": 2,
            "type": "TITLE2",
            "content": "title 2"
        },
        {
            "id": 3,
            "article_version_id": 2,
            "position": 3,
            "type": "TITLE3",
            "content": "title 3"
        },
        {
            "id": 4,
            "article_version_id": 2,
            "position": 4,
            "type": "PARAGRAPH",
            "content": "paragraph"
        },
        {
            "id": 5,
            "article_version_id": 2,
            "position": 5,
            "type": "IMAGE",
            "content": "45"
        },
        {
            "id": 6,
            "article_version_id": 2,
            "position": 6,
            "type": "FRAME",
            "content": "Frame"
        },
    ]

    def test_ok(self):
        self.db.insert({
            "id": 1,
            "title": "TITLE",
            "handle": "title",
            "status": "PUBLIC",
            "publication_date": "2021-01-24"
        }, self.db.tables["Article"])
        self.db.insert({"id": 2, "article_id": 1, "name": "VERSION 0", "is_main": 1}, self.db.tables["ArticleVersion"])
        self.db.insert({"id": 3, "article_version_id": 2, "position": 1, "type": "TITLE1", "content": "Text"},
                       self.db.tables["ArticleBox"])
        self.db.insert({"id": 4, "article_version_id": 2, "position": 2, "type": "TITLE2", "content": "Text2"},
                       self.db.tables["ArticleBox"])

        response = self.application.get('/public/get_article_content/title')

        self.assertEqual(200, response.status_code)
        self.assertEqual({
            'abstract': None,
            'content': [
                {
                    'article_version_id': 2,
                    'content': 'Text',
                    'id': 3,
                    'position': 1,
                    'type': 'TITLE1'
                },
                {
                    'article_version_id': 2,
                    'content': 'Text2',
                    'id': 4,
                    'position': 2,
                    'type': 'TITLE2'
                }
            ],
            'image': None,
            'link': None,
            'publication_date': '2021-01-24T00:00:00',
            'start_date': None,
            'end_date': None,
            'handle': 'title',
            'taxonomy_tags': [],
            'company_tags': [],
            'title': 'TITLE',
            'type': 'NEWS'
        }, response.json)

    def test_ok_html(self):
        self.db.insert({
            "id": 50,
            "thumbnail": bytes("", encoding='utf8'),
            "width": 10,
            "height": 10,
            "creation_date": datetime.datetime.today()
        }, self.db.tables["Image"])
        self.db.insert({
            "id": 1,
            "title": "TITLE",
            "handle": "title",
            "status": "PUBLIC",
            "publication_date": datetime.date.today() - datetime.timedelta(days=1),
            "image": 50
        }, self.db.tables["Article"])
        self.db.insert({"id": 2, "article_id": 1, "name": "VERSION 0", "is_main": 1}, self.db.tables["ArticleVersion"])
        self.db.insert(self.complete_article, self.db.tables["ArticleBox"])

        response = self.application.get('/public/get_article_content/title?format=html')

        self.assertEqual(200, response.status_code)
        self.assertEqual(
            bs4.BeautifulSoup("""<article>
                <div class='Article-content-cover'><img src='http://localhost:5000/public/get_image/50'/></div>
                <h1>TITLE</h1>
                <h2>title 1</h2>
                <h3>title 2</h3>
                <h4>title 3</h4>
                paragraph
                <div class='Article-content-image'><img src='http://localhost:5000/public/get_image/45'/></div>
                Frame
            </article>""", features="html.parser").prettify().encode('utf-8'),
            bs4.BeautifulSoup(response.json, features="html.parser").prettify().encode('utf-8'))

    def test_ok_markdown(self):
        self.db.insert({
            "id": 1,
            "title": "TITLE",
            "handle": "title",
            "status": "PUBLIC",
            "publication_date": "2021-01-24"
        }, self.db.tables["Article"])
        self.db.insert({"id": 2, "article_id": 1, "name": "VERSION 0", "is_main": 1}, self.db.tables["ArticleVersion"])
        self.db.insert(self.complete_article, self.db.tables["ArticleBox"])

        response = self.application.get('/public/get_article_content/title?format=markdown')

        self.assertEqual(200, response.status_code)
        self.assertEqual(
            open(
                os.path.join(
                    os.path.dirname(os.path.realpath(__file__)),
                    "test_get_article_content",
                    "test_ok_markdown_expected_result.md"), "r").read(),
            response.json
        )

    def test_ko_later_publication_date(self):
        self.db.insert({
            "id": 1,
            "title": "TITLE",
            "handle": "title",
            "status": "PUBLIC",
            "publication_date": datetime.date.today() + datetime.timedelta(days=1)
        }, self.db.tables["Article"])
        self.db.insert({"id": 2, "article_id": 1, "name": "VERSION 0", "is_main": 1}, self.db.tables["ArticleVersion"])
        self.db.insert({"id": 3, "article_version_id": 2, "position": 1, "type": "TITLE1", "content": "Text"},
                       self.db.tables["ArticleBox"])
        self.db.insert({"id": 4, "article_version_id": 2, "position": 2, "type": "TITLE2", "content": "Text2"},
                       self.db.tables["ArticleBox"])

        response = self.application.get('/public/get_article_content/title')

        self.assertEqual("422 The provided article ID does not exist or is not accessible", response.status)

    def test_ko_not_public_article(self):
        self.db.insert({
            "id": 1,
            "title": "TITLE",
            "handle": "title",
            "status": "DRAFT",
            "publication_date": datetime.date.today() - datetime.timedelta(days=1)
        }, self.db.tables["Article"])
        self.db.insert({"id": 2, "article_id": 1, "name": "VERSION 0", "is_main": 1}, self.db.tables["ArticleVersion"])
        self.db.insert({"id": 3, "article_version_id": 2, "position": 1, "type": "TITLE1", "content": "Text"},
                       self.db.tables["ArticleBox"])
        self.db.insert({"id": 4, "article_version_id": 2, "position": 2, "type": "TITLE2", "content": "Text2"},
                       self.db.tables["ArticleBox"])

        response = self.application.get('/public/get_article_content/title')

        self.assertEqual("422 The provided article ID does not exist or is not accessible", response.status)

    def test_ko_no_main_version(self):
        self.db.insert({
            "id": 1,
            "title": "TITLE",
            "handle": "title",
            "status": "PUBLIC",
            "publication_date": datetime.date.today() - datetime.timedelta(days=1)
        }, self.db.tables["Article"])
        self.db.insert({"id": 2, "article_id": 1, "name": "VERSION 0", "is_main": 0}, self.db.tables["ArticleVersion"])
        self.db.insert({"id": 3, "article_version_id": 2, "position": 1, "type": "TITLE1", "content": "Text"},
                       self.db.tables["ArticleBox"])
        self.db.insert({"id": 4, "article_version_id": 2, "position": 2, "type": "TITLE2", "content": "Text2"},
                       self.db.tables["ArticleBox"])

        response = self.application.get('/public/get_article_content/title')

        self.assertEqual("422 The provided article does not have a main version", response.status)

    def test_ko_get_unexisting_article(self):
        response = self.application.get('/public/get_article_content/2')

        self.assertEqual("422 The provided article ID does not exist or is not accessible", response.status)
