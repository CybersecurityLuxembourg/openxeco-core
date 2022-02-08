from test.BaseCase import BaseCase


class TestGetCompanyContacts(BaseCase):

    @BaseCase.login
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
        self.db.insert({
            "id": 2,
            "company_id": 2,
            "type": "EMAIL ADDRESS",
            "representative": "PHYSICAL PERSON",
            "name": "Name",
            "value": "+123456896",
        }, self.db.tables["CompanyContact"])

        response = self.application.get('/company/get_company_contacts/2', headers=self.get_standard_header(token))

        self.assertEqual(2, len(response.json))
        self.assertEqual(200, response.status_code)

    @BaseCase.login
    def test_ok_empty(self, token):

        response = self.application.get('/company/get_company_contacts/2', headers=self.get_standard_header(token))

        self.assertEqual(response.json, [])
        self.assertEqual(200, response.status_code)
