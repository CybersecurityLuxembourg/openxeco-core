from test.BaseCase import BaseCase


class TestAddTaxonomyTag(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        self.db.insert({"id": 1, "title": "My article"}, self.db.tables["Article"])
        self.db.insert({"name": "CAT"}, self.db.tables["TaxonomyCategory"])
        self.db.insert({"id": 1, "name": "VALUE", "category": "CAT"}, self.db.tables["TaxonomyValue"])

        payload = {
            "article": 1,
            "taxonomy_value": 1
        }

        response = self.application.post('/article/add_taxonomy_tag',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        tags = self.db.get(self.db.tables["ArticleTaxonomyTag"])

        self.assertEqual(200, response.status_code)
        self.assertEqual(len(tags), 1)
        self.assertEqual(tags[0].article, 1)
        self.assertEqual(tags[0].taxonomy_value, 1)

    @BaseCase.login
    def test_ko_unexisting_article_id(self, token):
        self.db.insert({"name": "CAT"}, self.db.tables["TaxonomyCategory"])
        self.db.insert({"id": 1, "name": "VALUE", "category": "CAT"}, self.db.tables["TaxonomyValue"])

        payload = {
            "article": 1,
            "taxonomy_value": 1
        }

        response = self.application.post('/article/add_taxonomy_tag',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        tags = self.db.get(self.db.tables["ArticleTaxonomyTag"])

        self.assertEqual("422 the provided article does not exist", response.status)
        self.assertEqual(len(tags), 0)

    @BaseCase.login
    def test_ko_unexisting_taxonomy_value(self, token):
        self.db.insert({"id": 1, "title": "My article"}, self.db.tables["Article"])

        payload = {
            "article": 1,
            "taxonomy_value": 1
        }

        response = self.application.post('/article/add_taxonomy_tag',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        tags = self.db.get(self.db.tables["ArticleTaxonomyTag"])

        self.assertEqual("422 the provided taxonomy value does not exist", response.status)
        self.assertEqual(len(tags), 0)