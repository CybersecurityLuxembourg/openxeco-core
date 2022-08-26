import datetime

from test.BaseCase import BaseCase


class TestGetMyArticle(BaseCase):

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
        self.db.insert({"article_id": 2, "entity_id": 14}, self.db.tables["ArticleEntityTag"])

        response = self.application.get('/private/get_my_article/2',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)
        self.assertEqual({
                'abstract': None,
                'end_date': None,
                'external_reference': None,
                'handle': 'handle-2',
                'id': 2,
                'image': None,
                'is_created_by_admin': 0,
                'link': None,
                'publication_date': '2021-01-22T00:00:00',
                'start_date': None,
                'status': 'PUBLIC',
                'sync_content': None,
                'sync_global': None,
                'sync_id': None,
                'sync_node': None,
                'sync_status': 'OK',
                'title': 'TITLE2',
                'type': 'NEWS'
            },
            response.json
        )

    @BaseCase.login
    def test_ko_not_found(self, token):

        response = self.application.get('/private/get_my_article/2',
                                        headers=self.get_standard_header(token))

        self.assertEqual("422 Article ID not found", response.status)

    @BaseCase.login
    def test_ok_no_entity_assigned(self, token):
        self.db.insert({
            "id": 2,
            "title": "TITLE2",
            "handle": "handle-2",
            "status": "PUBLIC",
            "publication_date": datetime.datetime.strptime('01-22-2021', '%m-%d-%Y').date()
        }, self.db.tables["Article"])

        response = self.application.get('/private/get_my_article/2',
                                        headers=self.get_standard_header(token))

        self.assertEqual("422 Article has no entity assigned", response.status)

    @BaseCase.login
    def test_ok_too_much_entity_assigned(self, token):
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
        self.db.insert({"article_id": 2, "entity_id": 14}, self.db.tables["ArticleEntityTag"])
        self.db.insert({"article_id": 2, "entity_id": 15}, self.db.tables["ArticleEntityTag"])

        response = self.application.get('/private/get_my_article/2',
                                        headers=self.get_standard_header(token))

        self.assertEqual("422 Article has too much entities assigned", response.status)

    @BaseCase.login
    def test_ok_user_not_assigned(self, token):
        self.db.insert({"id": 14, "name": "My entity"}, self.db.tables["Entity"])
        self.db.insert({
            "id": 2,
            "title": "TITLE2",
            "handle": "handle-2",
            "status": "PUBLIC",
            "publication_date": datetime.datetime.strptime('01-22-2021', '%m-%d-%Y').date()
        }, self.db.tables["Article"])
        self.db.insert({"article_id": 2, "entity_id": 14}, self.db.tables["ArticleEntityTag"])

        response = self.application.get('/private/get_my_article/2',
                                        headers=self.get_standard_header(token))

        self.assertEqual("422 User not assign to the entity", response.status)
