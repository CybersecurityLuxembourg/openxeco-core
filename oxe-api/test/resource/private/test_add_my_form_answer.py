from unittest.mock import patch

from sqlalchemy.exc import IntegrityError

from test.BaseCase import BaseCase


class TestAddFormAnswer(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        form = self.db.insert({"name": "CAT1"}, self.db.tables["Form"])
        question = self.db.insert({"form_id": form.id, "position": 1}, self.db.tables["FormQuestion"])

        payload = {
            "form_question_id": question.id,
            "value": "answer",
        }

        response = self.application.post('/private/add_my_form_answer',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        answers = self.db.get(self.db.tables["FormAnswer"])

        self.assertEqual(200, response.status_code)
        self.assertEqual(len(answers), 1)
        self.assertEqual(answers[0].value, "answer")
