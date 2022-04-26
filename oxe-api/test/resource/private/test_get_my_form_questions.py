from test.BaseCase import BaseCase
from utils.serializer import Serializer


class TestGetMyFormQuestions(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        self.db.insert({"id": 2, "email": "myemail@test.lu", "password": "MyWrongSecretSecret"}, self.db.tables["User"])
        form = Serializer.serialize(self.db.insert({"name": "FORM1", "status": "ACTIVE"}, self.db.tables["Form"]), self.db.tables["Form"])
        form2 = Serializer.serialize(self.db.insert({"name": "FORM2", "status": "ACTIVE"}, self.db.tables["Form"]), self.db.tables["Form"])
        question = Serializer.serialize(self.db.insert({"form_id": form['id'], "position": 1, "status": "ACTIVE"}, self.db.tables["FormQuestion"]), self.db.tables["FormQuestion"])
        question2 = Serializer.serialize(self.db.insert({"form_id": form['id'], "position": 2, "status": "ACTIVE"}, self.db.tables["FormQuestion"]), self.db.tables["FormQuestion"])
        Serializer.serialize(self.db.insert({"form_id": form2['id'], "position": 1, "status": "ACTIVE"}, self.db.tables["FormQuestion"]), self.db.tables["FormQuestion"])

        response = self.application.get('/private/get_my_form_questions?form_id=' + str(form['id']),
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)
        self.assertEqual(2, len(response.json))
        self.assertEqual(question['id'], response.json[0]["id"])
        self.assertEqual(question2['id'], response.json[1]["id"])

    @BaseCase.login
    def test_ok_with_inactive_question(self, token):
        form = Serializer.serialize(self.db.insert({"name": "FORM1", "status": "ACTIVE"}, self.db.tables["Form"]), self.db.tables["Form"])
        question = Serializer.serialize(self.db.insert({"form_id": form['id'], "position": 1, "status": "ACTIVE"}, self.db.tables["FormQuestion"]), self.db.tables["FormQuestion"])
        question2 = Serializer.serialize(self.db.insert({"form_id": form['id'], "position": 2, "status": "INACTIVE"}, self.db.tables["FormQuestion"]), self.db.tables["FormQuestion"])
        self.db.insert({"form_question_id": question['id'], "user_id": 1, "value": "YES"}, self.db.tables["FormAnswer"])
        self.db.insert({"form_question_id": question2['id'], "user_id": 1, "value": "YES"}, self.db.tables["FormAnswer"])

        response = self.application.get('/private/get_my_form_questions?form_id=' + str(form['id']),
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)
        self.assertEqual(1, len(response.json))
        self.assertEqual(question['id'], response.json[0]["id"])

    @BaseCase.login
    def test_ko_with_inactive_form(self, token):
        self.db.insert({"name": "FORM1", "status": "INACTIVE"}, self.db.tables["Form"])

        response = self.application.get('/private/get_my_form_questions?form_id=1',
                                        headers=self.get_standard_header(token))

        self.assertEqual("422 The requested form is not accessible", response.status)

    @BaseCase.login
    def test_ko_with_deleted_form(self, token):
        self.db.insert({"name": "FORM1", "status": "DELETED"}, self.db.tables["Form"])

        response = self.application.get('/private/get_my_form_questions?form_id=1',
                                        headers=self.get_standard_header(token))

        self.assertEqual("422 The requested form is not accessible", response.status)

    @BaseCase.login
    def test_ko_no_form(self, token):
        response = self.application.get('/private/get_my_form_questions?form_id=1',
                                        headers=self.get_standard_header(token))

        self.assertEqual("422 Form ID not found", response.status)
