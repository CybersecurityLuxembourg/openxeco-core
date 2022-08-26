from test.BaseCase import BaseCase


class TestDeleteMyArticle(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        self.db.insert({"id": 2, "title": "My title"}, self.db.tables["Article"])
        self.db.insert({"id": 3, "name": "My Entity"}, self.db.tables["Entity"])
        self.db.insert({"article_id": 2, "entity_id": 3}, self.db.tables["ArticleEntityTag"])
        self.db.insert({"user_id": 1, "entity_id": 3}, self.db.tables["UserEntityAssignment"])
        self.db.insert({"property": "ALLOW_ECOSYSTEM_TO_EDIT_ARTICLE", "value": "TRUE"}, self.db.tables["Setting"])

        payload = {"id": 2}

        response = self.application.post('/private/delete_my_article',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual(200, response.status_code)

    @BaseCase.login
    def test_ko_functionality_not_activated(self, token):

        payload = {"id": 2}

        response = self.application.post('/private/delete_my_article',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual("403 The article edition is deactivated", response.status)
        self.assertEqual(self.db.get_count(self.db.tables["Article"]), 0)
        self.assertEqual(self.db.get_count(self.db.tables["ArticleVersion"]), 0)

    @BaseCase.login
    def test_ko_delete_unexisting(self, token):
        self.db.insert({"property": "ALLOW_ECOSYSTEM_TO_EDIT_ARTICLE", "value": "TRUE"}, self.db.tables["Setting"])

        payload = {"id": 2}

        response = self.application.post('/private/delete_my_article',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual("422 Object not found : Article", response.status)

    @BaseCase.login
    def test_ko_article_no_entity_assigned(self, token):
        self.db.insert({"id": 2, "title": "My title"}, self.db.tables["Article"])
        self.db.insert({"id": 3, "name": "My Entity"}, self.db.tables["Entity"])
        self.db.insert({"user_id": 1, "entity_id": 3}, self.db.tables["UserEntityAssignment"])
        self.db.insert({"property": "ALLOW_ECOSYSTEM_TO_EDIT_ARTICLE", "value": "TRUE"}, self.db.tables["Setting"])

        payload = {"id": 2}

        response = self.application.post('/private/delete_my_article',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual("422 Article has no entity assigned", response.status)

    @BaseCase.login
    def test_ko_article_too_much_entity_assigned(self, token):
        self.db.insert({"id": 2, "title": "My title"}, self.db.tables["Article"])
        self.db.insert({"id": 3, "name": "My Entity"}, self.db.tables["Entity"])
        self.db.insert({"id": 4, "name": "My Entity"}, self.db.tables["Entity"])
        self.db.insert({"article_id": 2, "entity_id": 3}, self.db.tables["ArticleEntityTag"])
        self.db.insert({"article_id": 2, "entity_id": 4}, self.db.tables["ArticleEntityTag"])
        self.db.insert({"property": "ALLOW_ECOSYSTEM_TO_EDIT_ARTICLE", "value": "TRUE"}, self.db.tables["Setting"])

        payload = {"id": 2}

        response = self.application.post('/private/delete_my_article',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual("422 Article has too much entities assigned", response.status)

    @BaseCase.login
    def test_ko_user_not_assigned_to_entity(self, token):
        self.db.insert({"id": 2, "title": "My title"}, self.db.tables["Article"])
        self.db.insert({"id": 3, "name": "My Entity"}, self.db.tables["Entity"])
        self.db.insert({"article_id": 2, "entity_id": 3}, self.db.tables["ArticleEntityTag"])
        self.db.insert({"property": "ALLOW_ECOSYSTEM_TO_EDIT_ARTICLE", "value": "TRUE"}, self.db.tables["Setting"])

        payload = {"id": 2}

        response = self.application.post('/private/delete_my_article',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual("422 The user is not assign to the entity", response.status)