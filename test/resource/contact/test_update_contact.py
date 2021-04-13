from test.BaseCase import BaseCase


class TestUpdateContact(BaseCase):

    @BaseCase.login
    @BaseCase.grant_access("/contact/update_contact")
    def test_ok(self, token):
        self.db.insert({"id": 2, "name": "My Company"}, self.db.tables["Company"])
        self.db.insert({
            "id": 1,
            "company_id": 2,
            "type": "PHONE NUMBER",
            "representative": "ENTITY",
            "name": None,
            "value": "+123456896",
        }, self.db.tables["CompanyContact"])

        payload = {
            "id": 1,
            "company_id": 2,
            "type": "EMAIL ADDRESS",
            "representative": "ENTITY",
            "name": None,
            "value": "test@domain.com",
        }

        response = self.application.post('/contact/update_contact',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        contact = self.db.get(self.db.tables["CompanyContact"], {"id": 1})

        self.assertEqual(200, response.status_code)
        self.assertEqual(len(contact), 1)
        self.assertEqual(contact[0].type, "EMAIL ADDRESS")
        self.assertEqual(contact[0].representative, "ENTITY")
        self.assertEqual(contact[0].name, None)
        self.assertEqual(contact[0].value, "test@domain.com")
