from test.BaseCase import BaseCase


class TestDeleteCompanyTag(BaseCase):

    @BaseCase.login
    @BaseCase.grant_access("/article/delete_company_tag")
    def test_ok(self, token):
        self.db.insert({"id": 1, "title": "My article"}, self.db.tables["Article"])
        self.db.insert({"id": 1, "name": "COMPANY"}, self.db.tables["Company"])
        self.db.insert({"article": 1, "company": 1}, self.db.tables["ArticleCompanyTag"])

        payload = {
            "article": 1,
            "company": 1,
        }

        response = self.application.post('/article/delete_company_tag',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual(200, response.status_code)
        self.assertEqual(self.db.get_count(self.db.tables["Article"]), 1)
        self.assertEqual(self.db.get_count(self.db.tables["Company"]), 1)
        self.assertEqual(self.db.get_count(self.db.tables["ArticleCompanyTag"]), 0)

    @BaseCase.login
    @BaseCase.grant_access("/article/delete_company_tag")
    def test_delete_unexisting(self, token):
        payload = {
            "article": 1,
            "company": 1,
        }

        response = self.application.post('/article/delete_company_tag',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual("422 Object not found", response.status)
