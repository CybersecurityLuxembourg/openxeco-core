from test.BaseCase import BaseCase


class TestUpdateForm(BaseCase):

    @BaseCase.login
    @BaseCase.grant_access("/form/update_form")
    def test_ok(self, token):
        form = self.db.insert({"name": "FORM1"}, self.db.tables["Form"])

        payload = {
            "id": form.id,
            "name": "FORM2",
            "description": "desc",
            "status": "INACTIVE",
        }

        response = self.application.post('/form/update_form',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        forms = self.db.get(self.db.tables["Form"], {"id": form.id})

        self.assertEqual(200, response.status_code)
        self.assertEqual(len(forms), 1)
        self.assertEqual(forms[0].name, payload["name"])
        self.assertEqual(forms[0].description, payload["description"])
        self.assertEqual(forms[0].status, payload["status"])
