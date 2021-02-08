from test.BaseCase import BaseCase


class TestAddCompanyTag(BaseCase):

    @BaseCase.login
    @BaseCase.grant_access("/article/add_company_tag")
    def test_ok(self, token):
        self.db.insert({"id": 1, "title": "My article"}, self.db.tables["Article"])
        self.db.insert({"id": 1, "name": "COMPANY"}, self.db.tables["Company"])

        payload = {
            "article": 1,
            "company": 1
        }

        response = self.application.post('/article/add_company_tag',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        tags = self.db.get(self.db.tables["ArticleCompanyTag"])

        self.assertEqual(200, response.status_code)
        self.assertEqual(len(tags), 1)
        self.assertEqual(tags[0].article, 1)
        self.assertEqual(tags[0].company, 1)

    @BaseCase.login
    @BaseCase.grant_access("/article/add_company_tag")
    def test_ko_unexisting_article_id(self, token):
        self.db.insert({"id": 1, "name": "COMPANY"}, self.db.tables["Company"])

        payload = {
            "article": 1,
            "company": 1
        }

        response = self.application.post('/article/add_company_tag',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        tags = self.db.get(self.db.tables["ArticleCompanyTag"])

        self.assertEqual("422 the provided article does not exist", response.status)
        self.assertEqual(len(tags), 0)

    @BaseCase.login
    @BaseCase.grant_access("/article/add_company_tag")
    def test_ko_unexisting_taxonomy_value(self, token):
        self.db.insert({"id": 1, "title": "My article"}, self.db.tables["Article"])

        payload = {
            "article": 1,
            "company": 1
        }

        response = self.application.post('/article/add_company_tag',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        tags = self.db.get(self.db.tables["ArticleCompanyTag"])

        self.assertEqual("422 the provided company does not exist", response.status)
        self.assertEqual(len(tags), 0)
