from test.BaseCase import BaseCase


class TestGetNotifications(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        self.db.insert({"id": 1, "category": "CAT", "value": "val1"}, self.db.tables["DataControl"])
        self.db.insert({"id": 2, "category": "CAT", "value": "val1"}, self.db.tables["DataControl"])
        self.db.insert({"id": 1, "title": "TITLE", "status": "PUBLIC"}, self.db.tables["Article"])
        self.db.insert({"id": 2, "title": "TITLE", "status": "UNDER REVIEW"}, self.db.tables["Article"])
        self.db.insert({"id": 3, "title": "TITLE", "status": "UNDER REVIEW"}, self.db.tables["Article"])
        self.db.insert({"id": 1, "user_id": 1, "request": "", "status": "NEW"}, self.db.tables["UserRequest"])
        self.db.insert({"id": 2, "user_id": 1, "request": "", "status": "IN PROCESS"}, self.db.tables["UserRequest"])
        self.db.insert({"id": 3, "user_id": 1, "request": "", "status": "PROCESSED"}, self.db.tables["UserRequest"])
        self.db.insert({"id": 4, "user_id": 1, "request": "", "status": "REJECTED"}, self.db.tables["UserRequest"])
        self.db.insert({"id": 2, "email": "myemail@test.lu", "password": "MyWrongSecretSecret"}, self.db.tables["User"])
        self.db.insert({"id": 3, "email": "myemail@tes2.lu", "password": "MyWrongSecretSecret"}, self.db.tables["User"])
        form = self.db.insert({"name": "FORM1", "status": "ACTIVE"}, self.db.tables["Form"])
        form2 = self.db.insert({"name": "FORM2", "status": "INACTIVE"}, self.db.tables["Form"])
        question = self.db.insert({"form_id": form.id, "position": 1}, self.db.tables["FormQuestion"])
        self.db.insert({"form_question_id": question.id, "user_id": 1, "value": "answer"},
                                self.db.tables["FormAnswer"])
        self.db.insert({"form_question_id": question.id, "user_id": 2, "value": "answer"},
                       self.db.tables["FormAnswer"])
        self.db.insert({"form_question_id": question.id, "user_id": 3, "value": "answer"},
                       self.db.tables["FormAnswer"])
        question2 = self.db.insert({"form_id": form2.id, "position": 1}, self.db.tables["FormQuestion"])
        self.db.insert({"form_question_id": question2.id, "user_id": 1, "value": "answer"},
                       self.db.tables["FormAnswer"])

        response = self.application.get('/notification/get_notifications',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)
        self.assertEqual({
            "new_requests": 1,
            "data_control": 2,
            "articles_under_review": 2,
            "form_responses": 3,
        }, response.json)

    @BaseCase.login
    def test_ok_empty(self, token):

        response = self.application.get('/notification/get_notifications',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)
        self.assertEqual({
            "new_requests": 0,
            "data_control": 0,
            "articles_under_review": 0,
            "form_responses": 0,
        }, response.json)
