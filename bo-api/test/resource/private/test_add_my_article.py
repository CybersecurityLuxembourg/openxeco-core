from test.BaseCase import BaseCase


class TestAddMyArticle(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        self.db.insert({"id": 2, "name": "My Company"}, self.db.tables["Company"])
        self.db.insert({"user_id": 1, "company_id": 2}, self.db.tables["UserCompanyAssignment"])
        self.db.insert({"property": "ALLOW_ECOSYSTEM_TO_EDIT_ARTICLE", "value": "TRUE"}, self.db.tables["Setting"])

        title = "Article title with-dig1ts-and-letters"

        payload = {
            "title": title,
            "company": 2,
        }

        response = self.application.post('/private/add_my_article',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual(200, response.status_code)
        self.assertEqual(self.db.get_count(self.db.tables["Article"]), 1)
        self.assertEqual(self.db.get_count(self.db.tables["ArticleVersion"]), 1)

    @BaseCase.login
    def test_ko_functionality_not_activated(self, token):
        title = "Article title with-dig1ts-and-letters"

        payload = {
            "title": title,
            "company": 2,
        }

        response = self.application.post('/private/add_my_article',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual("403 The article edition is deactivated", response.status)
        self.assertEqual(self.db.get_count(self.db.tables["Article"]), 0)
        self.assertEqual(self.db.get_count(self.db.tables["ArticleVersion"]), 0)

    @BaseCase.login
    def test_ko_no_company(self, token):
        self.db.insert({"property": "ALLOW_ECOSYSTEM_TO_EDIT_ARTICLE", "value": "TRUE"}, self.db.tables["Setting"])

        title = "Article title with-dig1ts-and-letters"

        payload = {
            "title": title,
            "company": 2,
        }

        response = self.application.post('/private/add_my_article',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual("422 Object not found : Company", response.status)
        self.assertEqual(self.db.get_count(self.db.tables["Article"]), 0)
        self.assertEqual(self.db.get_count(self.db.tables["ArticleVersion"]), 0)

    @BaseCase.login
    def test_ko_no_assignment(self, token):
        self.db.insert({"id": 2, "name": "My Company"}, self.db.tables["Company"])
        self.db.insert({"property": "ALLOW_ECOSYSTEM_TO_EDIT_ARTICLE", "value": "TRUE"}, self.db.tables["Setting"])

        title = "Article title with-dig1ts-and-letters"

        payload = {
            "title": title,
            "company": 2,
        }

        response = self.application.post('/private/add_my_article',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual("422 The user is not assign to the company", response.status)
        self.assertEqual(self.db.get_count(self.db.tables["Article"]), 0)
        self.assertEqual(self.db.get_count(self.db.tables["ArticleVersion"]), 0)
