from test.BaseCase import BaseCase


class TestAddUserCompany(BaseCase):

    @BaseCase.login
    @BaseCase.grant_access("/user/add_user_company")
    def test_ok(self, token):
        self.db.insert({"id": 2, "email": "myemail@test.lu", "password": "MySecretSecret"}, self.db.tables["User"])
        self.db.insert({"id": 14, "name": "My company"}, self.db.tables["Company"])

        payload = {
            "user": 2,
            "company": 14,
        }

        response = self.application.post('/user/add_user_company',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        assignments = self.db.get(self.db.tables["UserCompanyAssignment"])

        print(response.status)
        self.assertEqual(200, response.status_code)
        self.assertEqual(len(assignments), 1)

    @BaseCase.login
    @BaseCase.grant_access("/user/add_user_company")
    def test_already_exist(self, token):
        self.db.insert({"id": 2, "email": "myemail@test.lu", "password": "MySecretSecret"}, self.db.tables["User"])
        self.db.insert({"id": 14, "name": "My company"}, self.db.tables["Company"])
        self.db.insert({"user_id": 2, "company_id": 14}, self.db.tables["UserCompanyAssignment"])

        payload = {
            "user": 2,
            "company": 14,
        }

        response = self.application.post('/user/add_user_company',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        assignments = self.db.get(self.db.tables["UserCompanyAssignment"])

        self.assertEqual("422 Object already existing", response.status)
        self.assertEqual(len(assignments), 1)
