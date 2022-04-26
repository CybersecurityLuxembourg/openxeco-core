from test.BaseCase import BaseCase
from utils.serializer import Serializer


class TestUpdateFormQuestionOrder(BaseCase):

    @BaseCase.login
    @BaseCase.grant_access("/form/update_form_question_order")
    def test_ok(self, token):
        form = self.db.insert({"name": "FORM1"}, self.db.tables["Form"])
        question1 = Serializer.serialize(
            self.db.insert({"form_id": form.id, "position": 1}, self.db.tables["FormQuestion"]),
            self.db.tables["FormQuestion"])
        question2 = Serializer.serialize(
            self.db.insert({"form_id": form.id, "position": 8}, self.db.tables["FormQuestion"]),
            self.db.tables["FormQuestion"])
        question3 = Serializer.serialize(
            self.db.insert({"form_id": form.id, "position": 1}, self.db.tables["FormQuestion"]),
            self.db.tables["FormQuestion"],)

        payload = {
            "form_id": form.id,
            "question_order": [question3["id"], question2["id"], question1["id"]],
        }

        response = self.application.post('/form/update_form_question_order',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        questions = self.db.get(self.db.tables["FormQuestion"])

        self.assertEqual(200, response.status_code)
        self.assertEqual([q.position for q in questions if q.id == question3["id"]][0], 1)
        self.assertEqual([q.position for q in questions if q.id == question2["id"]][0], 2)
        self.assertEqual([q.position for q in questions if q.id == question1["id"]][0], 3)

    @BaseCase.login
    @BaseCase.grant_access("/form/update_form_question_order")
    def test_ko_no_match_no_form(self, token):
        payload = {
            "form_id": 4,
            "question_order": [1, 2],
        }

        response = self.application.post('/form/update_form_question_order',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual("422 The provided question IDs does not match the form questions", response.status)

    @BaseCase.login
    @BaseCase.grant_access("/form/update_form_question_order")
    def test_ko_no_match_too_much_in_params(self, token):
        form = self.db.insert({"name": "FORM1"}, self.db.tables["Form"])
        form2 = self.db.insert({"name": "FORM2"}, self.db.tables["Form"])
        self.db.insert({"form_id": form.id, "position": 1}, self.db.tables["FormQuestion"])
        self.db.insert({"form_id": form.id, "position": 8}, self.db.tables["FormQuestion"])
        self.db.insert({"form_id": form2.id, "position": 1}, self.db.tables["FormQuestion"])

        payload = {
            "form_id": form.id,
            "question_order": [1, 2, 3],
        }

        response = self.application.post('/form/update_form_question_order',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual("422 The provided question IDs does not match the form questions", response.status)

    @BaseCase.login
    @BaseCase.grant_access("/form/update_form_question_order")
    def test_ko_no_match_not_enough_in_params(self, token):
        form = self.db.insert({"name": "FORM1"}, self.db.tables["Form"])
        self.db.insert({"form_id": form.id, "position": 1}, self.db.tables["FormQuestion"])
        self.db.insert({"form_id": form.id, "position": 8}, self.db.tables["FormQuestion"])
        self.db.insert({"form_id": form.id, "position": 1}, self.db.tables["FormQuestion"])

        payload = {
            "form_id": form.id,
            "question_order": [1, 2],
        }

        response = self.application.post('/form/update_form_question_order',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual("422 The provided question IDs does not match the form questions", response.status)

    @BaseCase.login
    @BaseCase.grant_access("/form/update_form_question_order")
    def test_ko_no_match_with_different_question(self, token):
        form = self.db.insert({"name": "FORM1"}, self.db.tables["Form"])
        self.db.insert({"form_id": form.id, "position": 1}, self.db.tables["FormQuestion"])
        self.db.insert({"form_id": form.id, "position": 8}, self.db.tables["FormQuestion"])
        self.db.insert({"form_id": form.id, "position": 1}, self.db.tables["FormQuestion"])

        payload = {
            "form_id": form.id,
            "question_order": [1, 2, 4],
        }

        response = self.application.post('/form/update_form_question_order',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual("422 The provided question IDs does not match the form questions", response.status)