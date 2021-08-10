from test.BaseCase import BaseCase

content = [
    {
        "type": "TITLE1",
        "content": "Title 1",
        "draggableHandle": ".draggable",
        "y": 1000000,
        "x": 0,
        "w": 1,
        "h": 6,
        "position": 1,
        "i": "0",
        "isResizable": True
    },
    {
        "type": "TITLE2",
        "content": "Title 2",
        "draggableHandle": ".draggable",
        "y": 1000000,
        "x": 0,
        "w": 1,
        "h": 6,
        "position": 2,
        "i": "1",
        "isResizable": True
    },
    {
        "type": "PARAGRAPH",
        "content": "<p>Text</p>",
        "draggableHandle": ".draggable",
        "y": 1000000,
        "x": 0,
        "w": 1,
        "h": 8.8,
        "position": 3,
        "i": "2",
        "isResizable": True
    }
]


class TestUpdateMyArticleContent(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        self.db.insert({"id": 2, "title": "My title"}, self.db.tables["Article"])
        self.db.insert({"id": 1, "article_id": 2, "name": "VERSION 0", "is_main": 1}, self.db.tables["ArticleVersion"])
        self.db.insert({"id": 3, "name": "My Company"}, self.db.tables["Company"])
        self.db.insert({"article": 2, "company": 3}, self.db.tables["ArticleCompanyTag"])
        self.db.insert({"user_id": 1, "company_id": 3}, self.db.tables["UserCompanyAssignment"])
        self.db.insert({"property": "ALLOW_ECOSYSTEM_TO_EDIT_ARTICLE", "value": "TRUE"}, self.db.tables["Setting"])
        self.db.insert({"property": "ALLOW_ECOSYSTEM_TO_EDIT_ARTICLE_CONTENT", "value": "TRUE"},
                       self.db.tables["Setting"])

        payload = {
            "article": 2,
            "content": content
        }

        response = self.application.post('/private/update_my_article_content',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual(200, response.status_code)
        self.assertEqual(3, self.db.get_count(self.db.tables["ArticleBox"]))

    @BaseCase.login
    def test_ko_article_edition_not_activated(self, token):

        payload = {
            "article": 2,
            "content": content
        }

        response = self.application.post('/private/update_my_article_content',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual("403 The article edition is deactivated", response.status)
        self.assertEqual(self.db.get_count(self.db.tables["Article"]), 0)
        self.assertEqual(self.db.get_count(self.db.tables["ArticleVersion"]), 0)

    @BaseCase.login
    def test_ko_article_content_edition_not_activated(self, token):
        self.db.insert({"property": "ALLOW_ECOSYSTEM_TO_EDIT_ARTICLE", "value": "TRUE"}, self.db.tables["Setting"])

        payload = {
            "article": 2,
            "content": content
        }

        response = self.application.post('/private/update_my_article_content',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual("403 The article content edition is deactivated", response.status)
        self.assertEqual(self.db.get_count(self.db.tables["Article"]), 0)
        self.assertEqual(self.db.get_count(self.db.tables["ArticleVersion"]), 0)

    @BaseCase.login
    def test_ko_update_unexisting(self, token):
        self.db.insert({"property": "ALLOW_ECOSYSTEM_TO_EDIT_ARTICLE", "value": "TRUE"}, self.db.tables["Setting"])
        self.db.insert({"property": "ALLOW_ECOSYSTEM_TO_EDIT_ARTICLE_CONTENT", "value": "TRUE"},
                       self.db.tables["Setting"])

        payload = {
            "article": 2,
            "content": content
        }

        response = self.application.post('/private/update_my_article_content',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual("422 Object not found : Article", response.status)

    @BaseCase.login
    def test_ko_article_no_company_assigned(self, token):
        self.db.insert({"id": 2, "title": "My title"}, self.db.tables["Article"])
        self.db.insert({"id": 3, "name": "My Company"}, self.db.tables["Company"])
        self.db.insert({"user_id": 1, "company_id": 3}, self.db.tables["UserCompanyAssignment"])
        self.db.insert({"property": "ALLOW_ECOSYSTEM_TO_EDIT_ARTICLE", "value": "TRUE"}, self.db.tables["Setting"])
        self.db.insert({"property": "ALLOW_ECOSYSTEM_TO_EDIT_ARTICLE_CONTENT", "value": "TRUE"},
                       self.db.tables["Setting"])

        payload = {
            "article": 2,
            "content": content
        }

        response = self.application.post('/private/update_my_article_content',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual("422 Article has no company assigned", response.status)

    @BaseCase.login
    def test_ko_article_too_much_company_assigned(self, token):
        self.db.insert({"id": 2, "title": "My title"}, self.db.tables["Article"])
        self.db.insert({"id": 3, "name": "My Company"}, self.db.tables["Company"])
        self.db.insert({"id": 4, "name": "My Company"}, self.db.tables["Company"])
        self.db.insert({"article": 2, "company": 3}, self.db.tables["ArticleCompanyTag"])
        self.db.insert({"article": 2, "company": 4}, self.db.tables["ArticleCompanyTag"])
        self.db.insert({"property": "ALLOW_ECOSYSTEM_TO_EDIT_ARTICLE", "value": "TRUE"}, self.db.tables["Setting"])
        self.db.insert({"property": "ALLOW_ECOSYSTEM_TO_EDIT_ARTICLE_CONTENT", "value": "TRUE"},
                       self.db.tables["Setting"])

        payload = {
            "article": 2,
            "content": content
        }

        response = self.application.post('/private/update_my_article_content',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual("422 Article has too much companies assigned", response.status)

    @BaseCase.login
    def test_ko_user_not_assigned_to_company(self, token):
        self.db.insert({"id": 2, "title": "My title"}, self.db.tables["Article"])
        self.db.insert({"id": 3, "name": "My Company"}, self.db.tables["Company"])
        self.db.insert({"article": 2, "company": 3}, self.db.tables["ArticleCompanyTag"])
        self.db.insert({"property": "ALLOW_ECOSYSTEM_TO_EDIT_ARTICLE", "value": "TRUE"}, self.db.tables["Setting"])
        self.db.insert({"property": "ALLOW_ECOSYSTEM_TO_EDIT_ARTICLE_CONTENT", "value": "TRUE"},
                       self.db.tables["Setting"])

        payload = {
            "article": 2,
            "content": content
        }

        response = self.application.post('/private/update_my_article_content',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual("422 The user is not assign to the company", response.status)

    @BaseCase.login
    def test_ko_main_version_not_found(self, token):
        self.db.insert({"id": 2, "title": "My title"}, self.db.tables["Article"])
        self.db.insert({"id": 3, "name": "My Company"}, self.db.tables["Company"])
        self.db.insert({"article": 2, "company": 3}, self.db.tables["ArticleCompanyTag"])
        self.db.insert({"user_id": 1, "company_id": 3}, self.db.tables["UserCompanyAssignment"])
        self.db.insert({"property": "ALLOW_ECOSYSTEM_TO_EDIT_ARTICLE", "value": "TRUE"}, self.db.tables["Setting"])
        self.db.insert({"property": "ALLOW_ECOSYSTEM_TO_EDIT_ARTICLE_CONTENT", "value": "TRUE"},
                       self.db.tables["Setting"])

        payload = {
            "article": 2,
            "content": content
        }

        response = self.application.post('/private/update_my_article_content',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual("422 Article main version not found. Please contact the administrator", response.status)

    @BaseCase.login
    def test_ko_too_much_main_version_found(self, token):
        self.db.insert({"id": 2, "title": "My title"}, self.db.tables["Article"])
        self.db.insert({"id": 1, "article_id": 2, "name": "VERSION 0", "is_main": 1}, self.db.tables["ArticleVersion"])
        self.db.insert({"id": 2, "article_id": 2, "name": "VERSION 1", "is_main": 1}, self.db.tables["ArticleVersion"])
        self.db.insert({"id": 3, "name": "My Company"}, self.db.tables["Company"])
        self.db.insert({"article": 2, "company": 3}, self.db.tables["ArticleCompanyTag"])
        self.db.insert({"user_id": 1, "company_id": 3}, self.db.tables["UserCompanyAssignment"])
        self.db.insert({"property": "ALLOW_ECOSYSTEM_TO_EDIT_ARTICLE", "value": "TRUE"}, self.db.tables["Setting"])
        self.db.insert({"property": "ALLOW_ECOSYSTEM_TO_EDIT_ARTICLE_CONTENT", "value": "TRUE"},
                       self.db.tables["Setting"])

        payload = {
            "article": 2,
            "content": content
        }

        response = self.application.post('/private/update_my_article_content',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual("422 Too much main version found. Please contact the administrator", response.status)

    @BaseCase.login
    def test_ko_wrong_content_type_found(self, token):
        self.db.insert({"id": 2, "title": "My title"}, self.db.tables["Article"])
        self.db.insert({"id": 1, "article_id": 2, "name": "VERSION 0", "is_main": 1}, self.db.tables["ArticleVersion"])
        self.db.insert({"id": 3, "name": "My Company"}, self.db.tables["Company"])
        self.db.insert({"article": 2, "company": 3}, self.db.tables["ArticleCompanyTag"])
        self.db.insert({"user_id": 1, "company_id": 3}, self.db.tables["UserCompanyAssignment"])
        self.db.insert({"property": "ALLOW_ECOSYSTEM_TO_EDIT_ARTICLE", "value": "TRUE"}, self.db.tables["Setting"])
        self.db.insert({"property": "ALLOW_ECOSYSTEM_TO_EDIT_ARTICLE_CONTENT", "value": "TRUE"},
                       self.db.tables["Setting"])
        self.db.insert({"property": "DEACTIVATE_REVIEW_ON_ECOSYSTEM_ARTICLE", "value": "TRUE"},
                       self.db.tables["Setting"])

        payload = {
            "article": 2,
            "content": [
              {
                "type": "OTHER TYPE",
                "content": "Title 1",
                "draggableHandle": ".draggable",
                "y": 1000000,
                "x": 0,
                "w": 1,
                "h": 6,
                "position": 1,
                "i": "0",
                "isResizable": True
              },
            ]
        }

        response = self.application.post('/private/update_my_article_content',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual("422 Wrong content type found: 'OTHER TYPE'", response.status)
