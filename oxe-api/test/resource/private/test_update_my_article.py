from test.BaseCase import BaseCase
import os
import base64


class TestUpdateMyArticle(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        self.db.insert({"id": 2, "title": "My title"}, self.db.tables["Article"])
        self.db.insert({"id": 3, "name": "My Entity"}, self.db.tables["Entity"])
        self.db.insert({"article_id": 2, "entity_id": 3}, self.db.tables["ArticleEntityTag"])
        self.db.insert({"user_id": 1, "entity_id": 3}, self.db.tables["UserEntityAssignment"])
        self.db.insert({"property": "ALLOW_ECOSYSTEM_TO_EDIT_ARTICLE", "value": "TRUE"}, self.db.tables["Setting"])

        payload = {"id": 2}

        response = self.application.post('/private/update_my_article',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual(200, response.status_code)

    @BaseCase.login
    def test_ok_with_image(self, token):
        self.db.insert({"id": 2, "title": "My title"}, self.db.tables["Article"])
        self.db.insert({"id": 3, "name": "My Entity"}, self.db.tables["Entity"])
        self.db.insert({"article_id": 2, "entity_id": 3}, self.db.tables["ArticleEntityTag"])
        self.db.insert({"user_id": 1, "entity_id": 3}, self.db.tables["UserEntityAssignment"])
        self.db.insert({"property": "ALLOW_ECOSYSTEM_TO_EDIT_ARTICLE", "value": "TRUE"}, self.db.tables["Setting"])
        self.db.insert({"property": "DEACTIVATE_REVIEW_ON_ECOSYSTEM_ARTICLE", "value": "TRUE"},
                       self.db.tables["Setting"])

        path = os.path.join(os.path.dirname(os.path.realpath(__file__)), "test_update_my_article", "original_image.png")
        target_path = os.path.join(os.path.dirname(os.path.realpath(__file__)), "test_update_my_article", "1")

        if os.path.exists(target_path):
            os.remove(target_path)

        f = open(path, 'rb')
        data = base64.b64encode(f.read()).decode("utf-8")

        payload = {
            "id": 2,
            "image": data
        }

        f.close()

        response = self.application.post('/private/update_my_article',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        articles = self.db.get(self.db.tables["Article"])

        self.assertEqual(200, response.status_code)
        self.assertEqual(len(articles), 1)
        self.assertEqual(articles[0].image, 1)

    @BaseCase.login
    def test_ko_functionality_not_activated(self, token):

        payload = {"id": 2}

        response = self.application.post('/private/update_my_article',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual("403 The article edition is deactivated", response.status)
        self.assertEqual(self.db.get_count(self.db.tables["Article"]), 0)
        self.assertEqual(self.db.get_count(self.db.tables["ArticleVersion"]), 0)

    @BaseCase.login
    def test_ko_update_unexisting(self, token):
        self.db.insert({"property": "ALLOW_ECOSYSTEM_TO_EDIT_ARTICLE", "value": "TRUE"}, self.db.tables["Setting"])

        payload = {"id": 2}

        response = self.application.post('/private/update_my_article',
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

        response = self.application.post('/private/update_my_article',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual("422 The article has no entity assigned", response.status)

    @BaseCase.login
    def test_ko_article_too_much_entity_assigned(self, token):
        self.db.insert({"id": 2, "title": "My title"}, self.db.tables["Article"])
        self.db.insert({"id": 3, "name": "My Entity"}, self.db.tables["Entity"])
        self.db.insert({"id": 4, "name": "My Entity"}, self.db.tables["Entity"])
        self.db.insert({"article_id": 2, "entity_id": 3}, self.db.tables["ArticleEntityTag"])
        self.db.insert({"article_id": 2, "entity_id": 4}, self.db.tables["ArticleEntityTag"])
        self.db.insert({"property": "ALLOW_ECOSYSTEM_TO_EDIT_ARTICLE", "value": "TRUE"}, self.db.tables["Setting"])

        payload = {"id": 2}

        response = self.application.post('/private/update_my_article',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual("422 The article has too much entities assigned", response.status)

    @BaseCase.login
    def test_ko_user_not_assigned_to_entity(self, token):
        self.db.insert({"id": 2, "title": "My title"}, self.db.tables["Article"])
        self.db.insert({"id": 3, "name": "My Entity"}, self.db.tables["Entity"])
        self.db.insert({"article_id": 2, "entity_id": 3}, self.db.tables["ArticleEntityTag"])
        self.db.insert({"property": "ALLOW_ECOSYSTEM_TO_EDIT_ARTICLE", "value": "TRUE"}, self.db.tables["Setting"])

        payload = {"id": 2}

        response = self.application.post('/private/update_my_article',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual("422 The user is not assign to the entity", response.status)

    @BaseCase.login
    def test_ko_article_handle_already_in_use(self, token):
        self.db.insert({"id": 2, "title": "My title"}, self.db.tables["Article"])
        self.db.insert({"id": 42, "title": "My title", "handle": "used_handle"}, self.db.tables["Article"])
        self.db.insert({"id": 3, "name": "My Entity"}, self.db.tables["Entity"])
        self.db.insert({"article_id": 2, "entity_id": 3}, self.db.tables["ArticleEntityTag"])
        self.db.insert({"user_id": 1, "entity_id": 3}, self.db.tables["UserEntityAssignment"])
        self.db.insert({"property": "ALLOW_ECOSYSTEM_TO_EDIT_ARTICLE", "value": "TRUE"}, self.db.tables["Setting"])

        payload = {
            "id": 2,
            "handle": "used_handle"
        }

        response = self.application.post('/private/update_my_article',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual("422 The article handle is already used", response.status)

    @BaseCase.login
    def test_ko_article_status_cant_be_public(self, token):
        self.db.insert({"id": 2, "title": "My title"}, self.db.tables["Article"])
        self.db.insert({"id": 3, "name": "My Entity"}, self.db.tables["Entity"])
        self.db.insert({"article_id": 2, "entity_id": 3}, self.db.tables["ArticleEntityTag"])
        self.db.insert({"user_id": 1, "entity_id": 3}, self.db.tables["UserEntityAssignment"])
        self.db.insert({"property": "ALLOW_ECOSYSTEM_TO_EDIT_ARTICLE", "value": "TRUE"}, self.db.tables["Setting"])

        payload = {
            "id": 2,
            "status": "PUBLIC"
        }

        response = self.application.post('/private/update_my_article',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual("422 The article status can't be set to 'PUBLIC'", response.status)

    @BaseCase.login
    def test_ko_article_status_cant_be_under_review(self, token):
        self.db.insert({"id": 2, "title": "My title"}, self.db.tables["Article"])
        self.db.insert({"id": 3, "name": "My Entity"}, self.db.tables["Entity"])
        self.db.insert({"article_id": 2, "entity_id": 3}, self.db.tables["ArticleEntityTag"])
        self.db.insert({"user_id": 1, "entity_id": 3}, self.db.tables["UserEntityAssignment"])
        self.db.insert({"property": "ALLOW_ECOSYSTEM_TO_EDIT_ARTICLE", "value": "TRUE"}, self.db.tables["Setting"])
        self.db.insert({"property": "DEACTIVATE_REVIEW_ON_ECOSYSTEM_ARTICLE", "value": "TRUE"},
                       self.db.tables["Setting"])

        payload = {
            "id": 2,
            "status": "UNDER REVIEW"
        }

        response = self.application.post('/private/update_my_article',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual("422 The article status can't be set to 'UNDER REVIEW'", response.status)
