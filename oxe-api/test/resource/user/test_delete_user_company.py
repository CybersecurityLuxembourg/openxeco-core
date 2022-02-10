from test.BaseCase import BaseCase


class TestDeleteUserCompany(BaseCase):

    @BaseCase.login
    @BaseCase.grant_access("/user/delete_user_company")
    def test_ok(self, token):
        self.db.insert({"id": 2, "email": "myemail@test.lu", "password": "MyWrongSecretSecret"}, self.db.tables["User"])
        self.db.insert({"id": 14, "name": "My company"}, self.db.tables["Company"])
        self.db.insert({"id": 15, "name": "My company2"}, self.db.tables["Company"])
        self.db.insert({"id": 16, "name": "Company3"}, self.db.tables["Company"])
        self.db.insert({"user_id": 2, "company_id": 14}, self.db.tables["UserCompanyAssignment"])
        self.db.insert({"user_id": 2, "company_id": 15}, self.db.tables["UserCompanyAssignment"])

        payload = {
            "user": 2,
            "company": 14,
        }

        response = self.application.post('/user/delete_user_company',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual(200, response.status_code)
        self.assertEqual(self.db.get_count(self.db.tables["UserCompanyAssignment"]), 1)

    @BaseCase.login
    @BaseCase.grant_access("/user/delete_user_company")
    def test_delete_unexisting(self, token):
        payload = {
            "user": 2,
            "company": 14,
        }

        response = self.application.post('/user/delete_user_company',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual("422 Object not found", response.status)
