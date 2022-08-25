import datetime

from test.BaseCase import BaseCase


class TestGetMyArticleContent(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        self.db.insert({"id": 14, "name": "My entity"}, self.db.tables["Entity"])
        self.db.insert({"user_id": 1, "entity_id": 14}, self.db.tables["UserEntityAssignment"])
        self.db.insert({
            "id": 2,
            "title": "TITLE2",
            "handle": "handle-2",
            "status": "PUBLIC",
            "publication_date": datetime.datetime.strptime('01-22-2021', '%m-%d-%Y').date()
        }, self.db.tables["Article"])
        self.db.insert({"id": 1, "article_id": 2, "name": "VERSION 0", "is_main": 1}, self.db.tables["ArticleVersion"])
        self.db.insert({"id": 1, "article_version_id": 1, "position": 1, "type": "TITLE1", "content": "title 1"},
                       self.db.tables["ArticleBox"])
        self.db.insert({"article": 2, "entity": 14}, self.db.tables["ArticleEntityTag"])

        response = self.application.get('/private/get_my_article_content/2',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)
        self.assertEqual([{
                "id": 1,
                "article_version_id": 1,
                "position": 1,
                "type": "TITLE1", "content":
                "title 1"
            }],
            response.json
        )

    @BaseCase.login
    def test_ko_not_found(self, token):

        response = self.application.get('/private/get_my_article_content/2',
                                        headers=self.get_standard_header(token))

        self.assertEqual("422 Article ID not found", response.status)

    @BaseCase.login
    def test_ko_no_entity_assigned(self, token):
        self.db.insert({
            "id": 2,
            "title": "TITLE2",
            "handle": "handle-2",
            "status": "PUBLIC",
            "publication_date": datetime.datetime.strptime('01-22-2021', '%m-%d-%Y').date()
        }, self.db.tables["Article"])

        response = self.application.get('/private/get_my_article_content/2',
                                        headers=self.get_standard_header(token))

        self.assertEqual("422 Article has no entity assigned", response.status)

    @BaseCase.login
    def test_ko_too_much_entity_assigned(self, token):
        self.db.insert({"id": 14, "name": "My entity"}, self.db.tables["Entity"])
        self.db.insert({"id": 15, "name": "My entity"}, self.db.tables["Entity"])
        self.db.insert({"user_id": 1, "entity_id": 14}, self.db.tables["UserEntityAssignment"])
        self.db.insert({"user_id": 1, "entity_id": 15}, self.db.tables["UserEntityAssignment"])
        self.db.insert({
            "id": 2,
            "title": "TITLE2",
            "handle": "handle-2",
            "status": "PUBLIC",
            "publication_date": datetime.datetime.strptime('01-22-2021', '%m-%d-%Y').date()
        }, self.db.tables["Article"])
        self.db.insert({"article": 2, "entity": 14}, self.db.tables["ArticleEntityTag"])
        self.db.insert({"article": 2, "entity": 15}, self.db.tables["ArticleEntityTag"])

        response = self.application.get('/private/get_my_article_content/2',
                                        headers=self.get_standard_header(token))

        self.assertEqual("422 Article has too much entities assigned", response.status)

    @BaseCase.login
    def test_ko_user_not_assigned(self, token):
        self.db.insert({"id": 14, "name": "My entity"}, self.db.tables["Entity"])
        self.db.insert({
            "id": 2,
            "title": "TITLE2",
            "handle": "handle-2",
            "status": "PUBLIC",
            "publication_date": datetime.datetime.strptime('01-22-2021', '%m-%d-%Y').date()
        }, self.db.tables["Article"])
        self.db.insert({"article": 2, "entity": 14}, self.db.tables["ArticleEntityTag"])

        response = self.application.get('/private/get_my_article_content/2',
                                        headers=self.get_standard_header(token))

        self.assertEqual("422 User not assign to the entity", response.status)

    @BaseCase.login
    def test_ko_no_main_version(self, token):
        self.db.insert({"id": 14, "name": "My entity"}, self.db.tables["Entity"])
        self.db.insert({"user_id": 1, "entity_id": 14}, self.db.tables["UserEntityAssignment"])
        self.db.insert({
            "id": 2,
            "title": "TITLE2",
            "handle": "handle-2",
            "status": "PUBLIC",
            "publication_date": datetime.datetime.strptime('01-22-2021', '%m-%d-%Y').date()
        }, self.db.tables["Article"])
        self.db.insert({"article": 2, "entity": 14}, self.db.tables["ArticleEntityTag"])

        response = self.application.get('/private/get_my_article_content/2',
                                        headers=self.get_standard_header(token))

        self.assertEqual("422 Article main version not found. Please contact the administrator", response.status)

    @BaseCase.login
    def test_ko_too_much_versions(self, token):
        self.db.insert({"id": 14, "name": "My entity"}, self.db.tables["Entity"])
        self.db.insert({"user_id": 1, "entity_id": 14}, self.db.tables["UserEntityAssignment"])
        self.db.insert({
            "id": 2,
            "title": "TITLE2",
            "handle": "handle-2",
            "status": "PUBLIC",
            "publication_date": datetime.datetime.strptime('01-22-2021', '%m-%d-%Y').date()
        }, self.db.tables["Article"])
        self.db.insert({"id": 1, "article_id": 2, "name": "VERSION 0", "is_main": 1}, self.db.tables["ArticleVersion"])
        self.db.insert({"id": 2, "article_id": 2, "name": "VERSION 1", "is_main": 1}, self.db.tables["ArticleVersion"])
        self.db.insert({"article": 2, "entity": 14}, self.db.tables["ArticleEntityTag"])

        response = self.application.get('/private/get_my_article_content/2',
                                        headers=self.get_standard_header(token))

        self.assertEqual("422 Too much main version found. Please contact the administrator", response.status)
