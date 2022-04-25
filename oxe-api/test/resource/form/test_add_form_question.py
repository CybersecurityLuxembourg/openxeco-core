from unittest.mock import patch

from sqlalchemy.exc import IntegrityError

from test.BaseCase import BaseCase


class TestAddFormQuestion(BaseCase):

    @BaseCase.login
    @BaseCase.grant_access("/form/add_form_question")
    def test_ok(self, token):
        form = self.db.insert({"name": "CAT1"}, self.db.tables["Form"])

        payload = {
            "form_id": form.id,
        }

        response = self.application.post('/form/add_form_question',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        questions = self.db.get(self.db.tables["FormQuestion"])

        self.assertEqual(200, response.status_code)
        self.assertEqual(len(questions), 1)
        self.assertEqual(questions[0].position, 1)

    @BaseCase.login
    @BaseCase.grant_access("/form/add_form_question")
    def test_ok_with_existing_questions(self, token):
        form = self.db.insert({"name": "CAT1"}, self.db.tables["Form"])
        self.db.insert({"form_id": form.id, "position": 1}, self.db.tables["FormQuestion"])
        self.db.insert({"form_id": form.id, "position": 4}, self.db.tables["FormQuestion"])

        payload = {
            "form_id": form.id,
        }

        response = self.application.post('/form/add_form_question',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        questions = self.db.get(self.db.tables["FormQuestion"])

        self.assertEqual(200, response.status_code)
        self.assertEqual(len(questions), 3)
        self.assertEqual(questions[2].position, 5)

    @BaseCase.login
    @BaseCase.grant_access("/form/add_form_question")
    def test_ko_missing_form(self, token):
        payload = {
            "form_id": 1,
        }

        response = self.application.post('/form/add_form_question',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual("422 The provided form ID does not exist", response.status)
