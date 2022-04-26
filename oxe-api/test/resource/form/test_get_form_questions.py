from test.BaseCase import BaseCase


class TestGetFormQuestions(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        form = self.db.insert({"name": "FORM1"}, self.db.tables["Form"])
        form2 = self.db.insert({"name": "FORM2"}, self.db.tables["Form"])
        self.db.insert({"form_id": form.id, "position": 1}, self.db.tables["FormQuestion"])
        self.db.insert({"form_id": form.id, "position": 2}, self.db.tables["FormQuestion"])
        self.db.insert({"form_id": form2.id, "position": 1}, self.db.tables["FormQuestion"])
        self.db.insert({"form_id": form.id, "position": 3}, self.db.tables["FormQuestion"])

        response = self.application.get('/form/get_form_questions?form_id=1',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)
        self.assertEqual(3, len(response.json))

    @BaseCase.login
    def test_ok_no_form(self, token):
        response = self.application.get('/form/get_form_questions?form_id=1',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)
        self.assertEqual(0, len(response.json))
