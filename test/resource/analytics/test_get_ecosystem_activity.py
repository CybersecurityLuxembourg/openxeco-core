from datetime import datetime, timedelta

from test.BaseCase import BaseCase


class TestGetEcosystemActivity(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        time = (datetime.now() - timedelta(1)).isoformat().split('.')[0]
        time2 = (datetime.now() - timedelta(3)).isoformat().split('.')[0]
        time3 = (datetime.now() - timedelta(5)).isoformat().split('.')[0]

        # Logs for news_publication

        self.db.insert({
            "id": 1,
            "title": "TITLE",
            "type": "NEWS",
            "status": "PUBLIC",
            "publication_date": (datetime.now() - timedelta(1)).strftime("%Y-%m-%d")
        }, self.db.tables["Article"])
        self.db.insert({
            "id": 2,
            "title": "TITLE",
            "type": "NEWS",
            "status": "PUBLIC",
            "publication_date": (datetime.now() - timedelta(1)).strftime("%Y-%m-%d")
        }, self.db.tables["Article"])
        self.db.insert({
            "id": 3,
            "title": "TITLE",
            "type": "NEWS",
            "status": "DRAFT",
            "publication_date": (datetime.now() - timedelta(1)).strftime("%Y-%m-%d")
        }, self.db.tables["Article"])
        self.db.insert({
            "id": 4,
            "title": "TITLE",
            "type": "NEWS",
            "status": "PUBLIC",
            "publication_date": (datetime.now() + timedelta(2)).strftime("%Y-%m-%d")
        }, self.db.tables["Article"])

        # Logs for event_publication

        # Logs for news_publication

        self.db.insert({
            "id": 10,
            "title": "TITLE",
            "type": "EVENT",
            "status": "PUBLIC",
            "publication_date": (datetime.now() - timedelta(4)).strftime("%Y-%m-%d")
        }, self.db.tables["Article"])
        self.db.insert({
            "id": 20,
            "title": "TITLE",
            "type": "EVENT",
            "status": "PUBLIC",
            "publication_date": (datetime.now() - timedelta(6)).strftime("%Y-%m-%d")
        }, self.db.tables["Article"])
        self.db.insert({
            "id": 30,
            "title": "TITLE",
            "type": "EVENT",
            "status": "DRAFT",
            "publication_date": (datetime.now() - timedelta(1)).strftime("%Y-%m-%d")
        }, self.db.tables["Article"])
        self.db.insert({
            "id": 40,
            "title": "TITLE",
            "type": "EVENT",
            "status": "PUBLIC",
            "publication_date": (datetime.now() + timedelta(2)).strftime("%Y-%m-%d")
        }, self.db.tables["Article"])

        # Logs for job_offer_publication

        # Logs for news_publication

        self.db.insert({
            "id": 11,
            "title": "TITLE",
            "type": "JOB OFFER",
            "status": "PUBLIC",
            "publication_date": (datetime.now() - timedelta(7)).strftime("%Y-%m-%d")
        }, self.db.tables["Article"])
        self.db.insert({
            "id": 21,
            "title": "TITLE",
            "type": "JOB OFFER",
            "status": "PUBLIC",
            "publication_date": (datetime.now() - timedelta(9)).strftime("%Y-%m-%d")
        }, self.db.tables["Article"])
        self.db.insert({
            "id": 31,
            "title": "TITLE",
            "type": "JOB OFFER",
            "status": "DRAFT",
            "publication_date": (datetime.now() - timedelta(1)).strftime("%Y-%m-%d")
        }, self.db.tables["Article"])
        self.db.insert({
            "id": 41,
            "title": "TITLE",
            "type": "JOB OFFER",
            "status": "PUBLIC",
            "publication_date": (datetime.now() + timedelta(2)).strftime("%Y-%m-%d")
        }, self.db.tables["Article"])

        # Logs for account_creation

        self.db.insert({
            "id": 2,
            "email": "myemail@test.lu",
            "password": "MyWrongSecretSecret",
            "is_admin": False,
            "sys_date": time,
        }, self.db.tables["User"])
        self.db.insert({
            "id": 3,
            "email": "myemail2@test.lu",
            "password": "MyWrongSecretSecret",
            "is_admin": False,
            "sys_date": time2,
        }, self.db.tables["User"])
        self.db.insert({  # Not counted as he is admin
            "id": 4,
            "email": "myemail3@test.lu",
            "password": "MyWrongSecretSecret",
            "is_admin": True,
            "sys_date": time3,
        }, self.db.tables["User"])

        # Logs for action

        self.db.insert({  # Not counted as there is a 500 code
            "user_id": 2,
            "request_method": "POST",
            "request": "/article/update_article_version_content",
            "params": '{"article_version_id": 25}',
            'sys_date': time,
            "status_code": 500,
        }, self.db.tables["Log"])
        self.db.insert({
            "user_id": 2,
            "request_method": "POST",
            "request": "/article/other_resource",
            "params": '{"article_version_id": 2}',
            'sys_date': time,
            "status_code": 200,
        }, self.db.tables["Log"])
        self.db.insert({  # Not counted as it is a GET request
            "request_method": "GET",
            "request": "/article/other_resource",
            "params": '{"article_version_id": 2}',
            'sys_date': time,
            "status_code": 200,
        }, self.db.tables["Log"])
        self.db.insert({  # Not counted as the user is admin
            "user_id": 4,
            "request_method": "POST",
            "request": "/article/other_resource",
            "params": '{"article_version_id": 2}',
            'sys_date': time,
            "status_code": 200,
        }, self.db.tables["Log"])

        # Query

        response = self.application.get('/analytics/get_ecosystem_activity',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)
        self.assertEqual({
            "news_publication": {
                (datetime.now() - timedelta(1)).strftime("%Y-%m-%d"): 2,
                (datetime.now() + timedelta(2)).strftime("%Y-%m-%d"): 1
            },
            "event_publication": {
                (datetime.now() - timedelta(4)).strftime("%Y-%m-%d"): 1,
                (datetime.now() - timedelta(6)).strftime("%Y-%m-%d"): 1,
                (datetime.now() + timedelta(2)).strftime("%Y-%m-%d"): 1
            },
            "job_offer_publication": {
                (datetime.now() - timedelta(7)).strftime("%Y-%m-%d"): 1,
                (datetime.now() - timedelta(9)).strftime("%Y-%m-%d"): 1,
                (datetime.now() + timedelta(2)).strftime("%Y-%m-%d"): 1
            },
            "account_creation": {
                (datetime.now() - timedelta(3)).strftime("%Y-%m-%d"): 1,
                (datetime.now() - timedelta(1)).strftime("%Y-%m-%d"): 1
            },
            "action": {
                (datetime.now() - timedelta(1)).strftime("%Y-%m-%d"): 1
            },
        }, response.json)
