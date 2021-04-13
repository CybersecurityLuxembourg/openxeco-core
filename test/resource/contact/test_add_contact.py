from test.BaseCase import BaseCase


class TestAddContact(BaseCase):

    @BaseCase.login
    @BaseCase.grant_access("/contact/add_contact")
    def test_ok(self, token):
        self.db.insert({"id": 2, "name": "My Company"}, self.db.tables["Company"])

        payload = {
            "company_id": 2,
            "type": "PHONE NUMBER",
            "representative": "ENTITY",
            "name": None,
            "value": "+123456896",
        }

        response = self.application.post('/contact/add_contact',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual(200, response.status_code)
        self.assertEqual(self.db.get_count(self.db.tables["CompanyContact"]), 1)

    @BaseCase.login
    @BaseCase.grant_access("/contact/add_contact")
    def test_ko_missing_contact(self, token):
        payload = {
            "company_id": 2,
            "type": "PHONE NUMBER",
            "representative": "ENTITY",
            "name": None,
            "value": "+123456896",
        }

        response = self.application.post('/contact/add_contact',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual(422, response.status_code)
        self.assertEqual("422 Provided company not existing", response.status)
