from test.BaseCase import BaseCase


class TestDeleteEntityTag(BaseCase):

    @BaseCase.login
    @BaseCase.grant_access("/article/delete_entity_tag")
    def test_ok(self, token):
        self.db.insert({"id": 1, "title": "My article"}, self.db.tables["Article"])
        self.db.insert({"id": 1, "name": "ENTITY"}, self.db.tables["Entity"])
        self.db.insert({"article": 1, "entity": 1}, self.db.tables["ArticleEntityTag"])

        payload = {
            "article": 1,
            "entity": 1,
        }

        response = self.application.post('/article/delete_entity_tag',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual(200, response.status_code)
        self.assertEqual(self.db.get_count(self.db.tables["Article"]), 1)
        self.assertEqual(self.db.get_count(self.db.tables["Entity"]), 1)
        self.assertEqual(self.db.get_count(self.db.tables["ArticleEntityTag"]), 0)

    @BaseCase.login
    @BaseCase.grant_access("/article/delete_entity_tag")
    def test_delete_unexisting(self, token):
        payload = {
            "article": 1,
            "entity": 1,
        }

        response = self.application.post('/article/delete_entity_tag',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual("422 Object not found", response.status)
