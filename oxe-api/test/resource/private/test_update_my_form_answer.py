from test.BaseCase import BaseCase
from utils.serializer import Serializer


class TestUpdateMyFormAnswer(BaseCase):

    @BaseCase.login
    @BaseCase.grant_access("/form/update_form_question")
    def test_ok(self, token):
        form = self.db.insert({"name": "FORM1"}, self.db.tables["Form"])
        question = Serializer.serialize(
            self.db.insert({"form_id": form.id, "position": 1}, self.db.tables["FormQuestion"]),
            self.db.tables["FormQuestion"])
        answer = Serializer.serialize(
            self.db.insert({"form_question_id": question["id"], "user_id": 1, "value": "answer"}, self.db.tables["FormAnswer"]),
            self.db.tables["FormAnswer"])

        payload = {
            "id": answer["id"],
            "value": "new answer",
        }

        response = self.application.post('/private/update_my_form_answer',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        answers = self.db.get(self.db.tables["FormAnswer"], {"id": question["id"]})

        self.assertEqual(200, response.status_code)
        self.assertEqual(len(answers), 1)
        self.assertEqual(answers[0].value, payload["value"])
