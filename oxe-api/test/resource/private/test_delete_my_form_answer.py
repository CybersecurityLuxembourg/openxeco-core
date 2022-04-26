from test.BaseCase import BaseCase


class TestDeleteMyFormAnswer(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        form = self.db.insert({"name": "FORM1"}, self.db.tables["Form"])
        question = self.db.insert({"form_id": form.id, "position": 1}, self.db.tables["FormQuestion"])
        answer = self.db.insert({"form_question_id": question.id, "user_id": 1}, self.db.tables["FormAnswer"])

        payload = {"id": answer.id}

        response = self.application.post('/private/delete_my_form_answer',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual(200, response.status_code)
        self.assertEqual(self.db.get_count(self.db.tables["FormAnswer"]), 0)

    @BaseCase.login
    def test_delete_unexisting(self, token):
        payload = {"id": 42}

        response = self.application.post('/private/delete_my_form_answer',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual("422 Object not found", response.status)
