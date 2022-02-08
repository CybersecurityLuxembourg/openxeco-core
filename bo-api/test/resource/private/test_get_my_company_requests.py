from test.BaseCase import BaseCase


class TestGetMyCompanyRequests(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        self.db.insert({"id": 2, "email": "myemail@test.lu", "password": "MyWrongSecretSecret"}, self.db.tables["User"])

        self.db.insert({"id": 1, "name": "My Company 1"}, self.db.tables["Company"])
        self.db.insert({"id": 2, "name": "My Company 1"}, self.db.tables["Company"])

        self.db.insert({"user_id": 1, "company_id": 1}, self.db.tables["UserCompanyAssignment"])
        self.db.insert({"user_id": 2, "company_id": 1}, self.db.tables["UserCompanyAssignment"])
        self.db.insert({"user_id": 1, "company_id": 2}, self.db.tables["UserCompanyAssignment"])

        self.db.insert({
            "id": 1,
            "user_id": 1,
            "request": "My request",
            "company_id": 1
        }, self.db.tables["UserRequest"])

        self.db.insert({
            "id": 2,
            "user_id": 2,
            "request": "Request from another user",
            "company_id": 1
        }, self.db.tables["UserRequest"])

        self.db.insert({
            "id": 3,
            "user_id": 1,
            "request": "Request for another company",
            "company_id": 2
        }, self.db.tables["UserRequest"])

        response = self.application.get('/private/get_my_company_requests/1',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)
        self.assertEqual(len(response.json), 2)
        self.assertEqual(response.json[0]["id"], 1)
        self.assertEqual(response.json[1]["id"], 2)

    @BaseCase.login
    def test_ko_not_assigned(self, token):
        self.db.insert({"id": 2, "email": "myemail@test.lu", "password": "MyWrongSecretSecret"}, self.db.tables["User"])

        self.db.insert({"id": 1, "name": "My Company 1"}, self.db.tables["Company"])

        response = self.application.get('/private/get_my_company_requests/1',
                                        headers=self.get_standard_header(token))

        self.assertEqual("422 Object not found or you don't have the required access to it", response.status)
