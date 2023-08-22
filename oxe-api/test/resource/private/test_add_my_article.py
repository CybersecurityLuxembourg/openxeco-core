from test.BaseCase import BaseCase
from unittest.mock import patch


class TestAddMyArticle(BaseCase):

    @BaseCase.login
    @patch('resource.private.add_my_article.send_email')
    def test_ok(self, mock_send_mail, token):
        mock_send_mail.return_value = None

        self.db.insert({"id": 2, "name": "My Entity"}, self.db.tables["Entity"])
        self.db.insert({"user_id": 1, "entity_id": 2}, self.db.tables["UserEntityAssignment"])
        self.db.insert({"property": "ALLOW_ECOSYSTEM_TO_EDIT_ARTICLE", "value": "TRUE"}, self.db.tables["Setting"])

        title = "Article title with-dig1ts-and-letters"

        payload = {
            "title": title,
            "entity_id": 2,
        }

        response = self.application.post('/private/add_my_article',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual(200, response.status_code)
        self.assertEqual(self.db.get_count(self.db.tables["Article"]), 1)
        self.assertEqual(self.db.get_count(self.db.tables["ArticleVersion"]), 1)
        mock_send_mail.assert_called_once()

    @BaseCase.login
    def test_ko_functionality_not_activated(self, token):
        title = "Article title with-dig1ts-and-letters"

        payload = {
            "title": title,
            "entity_id": 2,
        }

        response = self.application.post('/private/add_my_article',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual("403 The article edition is deactivated", response.status)
        self.assertEqual(self.db.get_count(self.db.tables["Article"]), 0)
        self.assertEqual(self.db.get_count(self.db.tables["ArticleVersion"]), 0)

    @BaseCase.login
    def test_ko_no_entity(self, token):
        self.db.insert({"property": "ALLOW_ECOSYSTEM_TO_EDIT_ARTICLE", "value": "TRUE"}, self.db.tables["Setting"])

        title = "Article title with-dig1ts-and-letters"

        payload = {
            "title": title,
            "entity_id": 2,
        }

        response = self.application.post('/private/add_my_article',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual("422 Object not found : Entity", response.status)
        self.assertEqual(self.db.get_count(self.db.tables["Article"]), 0)
        self.assertEqual(self.db.get_count(self.db.tables["ArticleVersion"]), 0)

    @BaseCase.login
    def test_ko_no_assignment(self, token):
        self.db.insert({"id": 2, "name": "My Entity"}, self.db.tables["Entity"])
        self.db.insert({"property": "ALLOW_ECOSYSTEM_TO_EDIT_ARTICLE", "value": "TRUE"}, self.db.tables["Setting"])

        title = "Article title with-dig1ts-and-letters"

        payload = {
            "title": title,
            "entity_id": 2,
        }

        response = self.application.post('/private/add_my_article',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual("422 The user is not assign to the entity", response.status)
        self.assertEqual(self.db.get_count(self.db.tables["Article"]), 0)
        self.assertEqual(self.db.get_count(self.db.tables["ArticleVersion"]), 0)
