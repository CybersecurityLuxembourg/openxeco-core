from test.BaseCase import BaseCase


class TestGetFormAnswers(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        form = self.db.insert({"name": "FORM1"}, self.db.tables["Form"])
        form2 = self.db.insert({"name": "FORM2"}, self.db.tables["Form"])
        question = self.db.insert({"form_id": form.id, "position": 1}, self.db.tables["FormQuestion"])
        question2 = self.db.insert({"form_id": form.id, "position": 2}, self.db.tables["FormQuestion"])
        question3 = self.db.insert({"form_id": form2.id, "position": 1}, self.db.tables["FormQuestion"])
        self.db.insert({"form_id": form.id, "position": 3}, self.db.tables["FormQuestion"])
        self.db.insert({"form_question_id": question.id, "user_id": 1, "value": "YES"}, self.db.tables["FormAnswer"])
        self.db.insert({"form_question_id": question2.id, "user_id": 1, "value": "YES"}, self.db.tables["FormAnswer"])
        self.db.insert({"form_question_id": question3.id, "user_id": 1, "value": "YES"}, self.db.tables["FormAnswer"])

        response = self.application.get('/form/get_form_answers?form_id=1',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)
        self.assertEqual(2, len(response.json))

    @BaseCase.login
    def test_ok_no_form(self, token):
        response = self.application.get('/form/get_form_answers?form_id=1',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)
        self.assertEqual(0, len(response.json))
