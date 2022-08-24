from test.BaseCase import BaseCase


class TestGetUserCompanyAssignments(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        self.db.insert({"id": 14, "email": "myemail@test.lu", "password": "MyWrongSecret"}, self.db.tables["User"])
        self.db.insert({"id": 2, "name": "My Company"}, self.db.tables["Company"])
        self.db.insert({"user_id": 14, "company_id": 2, "department": "TOP MANAGEMENT"},
                       self.db.tables["UserCompanyAssignment"])

        response = self.application.get('/user/get_user_company_assignments',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)
        self.assertEqual([{'user_id': 14, 'company_id': 2, 'department': "TOP MANAGEMENT"}], response.json)
