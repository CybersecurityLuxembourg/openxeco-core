from test.BaseCase import BaseCase


class TestGetUserCompanies(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        self.db.insert({"id": 2, "email": "myemail@email.lu", "password": "My password"}, self.db.tables["User"])
        self.db.insert({"id": 14, "name": "My company"}, self.db.tables["Company"])
        self.db.insert({"id": 15, "name": "My company2"}, self.db.tables["Company"])
        self.db.insert({"id": 16, "name": "Company3"}, self.db.tables["Company"])
        self.db.insert({"user_id": 2, "company_id": 14}, self.db.tables["UserCompanyAssignment"])
        self.db.insert({"user_id": 2, "company_id": 15}, self.db.tables["UserCompanyAssignment"])

        response = self.application.get('/user/get_user_companies/2',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)
        self.assertEqual([
            {'company_id': 14, 'department': None, 'user_id': 2},
            {'company_id': 15, 'department': None, 'user_id': 2}
        ], response.json)
