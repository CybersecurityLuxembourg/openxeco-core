from test.BaseCase import BaseCase


class TestAddMyArticle(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        self.db.insert({"id": 2, "name": "My Company"}, self.db.tables["Company"])
        self.db.insert({"user_id": 1, "company_id": 2}, self.db.tables["UserCompanyAssignment"])

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
    def test_ko_no_company(self, token):

        title = "Article title with-dig1ts-and-letters"

        payload = {
            "title": title,
            "company": 2,
        }

        response = self.application.post('/private/add_my_article',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual("422 Company ID not found", response.status)
        self.assertEqual(self.db.get_count(self.db.tables["Article"]), 0)
        self.assertEqual(self.db.get_count(self.db.tables["ArticleVersion"]), 0)

    @BaseCase.login
    def test_ko_no_assignment(self, token):
        self.db.insert({"id": 2, "name": "My Company"}, self.db.tables["Company"])

        title = "Article title with-dig1ts-and-letters"

        payload = {
            "title": title,
            "company": 2,
        }

        response = self.application.post('/private/add_my_article',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual("422 User not assign to the company", response.status)
        self.assertEqual(self.db.get_count(self.db.tables["Article"]), 0)
        self.assertEqual(self.db.get_count(self.db.tables["ArticleVersion"]), 0)
