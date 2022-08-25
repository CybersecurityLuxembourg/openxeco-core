from test.BaseCase import BaseCase


class TestAddEntityTag(BaseCase):

    @BaseCase.login
    @BaseCase.grant_access("/article/add_entity_tag")
    def test_ok(self, token):
        self.db.insert({"id": 1, "title": "My article"}, self.db.tables["Article"])
        self.db.insert({"id": 1, "name": "ENTITY"}, self.db.tables["Entity"])

        payload = {
            "article": 1,
            "entity": 1
        }

        response = self.application.post('/article/add_entity_tag',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        tags = self.db.get(self.db.tables["ArticleEntityTag"])

        self.assertEqual(200, response.status_code)
        self.assertEqual(len(tags), 1)
        self.assertEqual(tags[0].article, 1)
        self.assertEqual(tags[0].entity, 1)

    @BaseCase.login
    @BaseCase.grant_access("/article/add_entity_tag")
    def test_ko_unexisting_article_id(self, token):
        self.db.insert({"id": 1, "name": "ENTITY"}, self.db.tables["Entity"])

        payload = {
            "article": 1,
            "entity": 1
        }

        response = self.application.post('/article/add_entity_tag',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        tags = self.db.get(self.db.tables["ArticleEntityTag"])

        self.assertEqual("422 The provided article does not exist", response.status)
        self.assertEqual(len(tags), 0)

    @BaseCase.login
    @BaseCase.grant_access("/article/add_entity_tag")
    def test_ko_unexisting_taxonomy_value(self, token):
        self.db.insert({"id": 1, "title": "My article"}, self.db.tables["Article"])

        payload = {
            "article": 1,
            "entity": 1
        }

        response = self.application.post('/article/add_entity_tag',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        tags = self.db.get(self.db.tables["ArticleEntityTag"])

        self.assertEqual("422 The provided entity does not exist", response.status)
        self.assertEqual(len(tags), 0)
