from test.BaseCase import BaseCase


class TestGetMyForms(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        self.db.insert({"name": "FORM1", "status": "ACTIVE"}, self.db.tables["Form"])
        self.db.insert({"name": "FORM2", "status": "INACTIVE"}, self.db.tables["Form"])
        self.db.insert({"name": "FORM3", "status": "DELETED"}, self.db.tables["Form"])

        response = self.application.get('/private/get_my_forms',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)
        self.assertEqual(1, len(response.json))

    @BaseCase.login
    def test_ok_no_form(self, token):
        response = self.application.get('/private/get_my_forms',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)
        self.assertEqual(0, len(response.json))
