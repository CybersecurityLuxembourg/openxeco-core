from test.BaseCase import BaseCase
from utils.serializer import Serializer


class TestUpdateFormQuestion(BaseCase):

    @BaseCase.login
    @BaseCase.grant_access("/form/update_form_question")
    def test_ok(self, token):
        form = self.db.insert({"name": "FORM1"}, self.db.tables["Form"])
        question = Serializer.serialize(
            self.db.insert({"form_id": form.id, "position": 1}, self.db.tables["FormQuestion"]),
            self.db.tables["FormQuestion"])

        payload = {
            "id": question["id"],
            "position": 2,
            "type": "OPTIONS",
            "options": "YES|NO",
            "value": "questions?",
            "status": "INACTIVE",
        }

        response = self.application.post('/form/update_form_question',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        questions = self.db.get(self.db.tables["FormQuestion"], {"id": question["id"]})

        self.assertEqual(200, response.status_code)
        self.assertEqual(len(questions), 1)
        self.assertEqual(questions[0].position, payload["position"])
        self.assertEqual(questions[0].type, payload["type"])
        self.assertEqual(questions[0].options, payload["options"])
        self.assertEqual(questions[0].value, payload["value"])
        self.assertEqual(questions[0].status, payload["status"])
