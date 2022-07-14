from test.BaseCase import BaseCase


class TestGetMyCompanyAddresses(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        self.db.insert({"id": 2, "email": "myemail@test.lu", "password": "MyWrongSecretSecret"}, self.db.tables["User"])

        self.db.insert({"id": 1, "name": "My Company 1"}, self.db.tables["Company"])
        self.db.insert({"id": 2, "name": "My Company 2"}, self.db.tables["Company"])
        self.db.insert({"id": 3, "name": "My Company 3"}, self.db.tables["Company"])

        self.db.insert({"user_id": 1, "company_id": 1}, self.db.tables["UserCompanyAssignment"])
        self.db.insert({"user_id": 1, "company_id": 2}, self.db.tables["UserCompanyAssignment"])
        self.db.insert({"user_id": 2, "company_id": 3}, self.db.tables["UserCompanyAssignment"])

        self.db.insert({
            "id": 1,
            "company_id": 1,
            "address_1": "Rue inconnue",
            "address_2": None,
            "number": None,
            "postal_code": "1515",
            "city": "Luxembourg",
            "administrative_area": None,
            "country": "Luxembourg",
            "latitude": None,
            "longitude": None,
        }, self.db.tables["CompanyAddress"])

        self.db.insert({
            "id": 2,
            "company_id": 3,
            "address_1": "Rue inconnue",
            "address_2": None,
            "number": None,
            "postal_code": "1515",
            "city": "Luxembourg",
            "administrative_area": None,
            "country": "Luxembourg",
            "latitude": None,
            "longitude": None,
        }, self.db.tables["CompanyAddress"])

        response = self.application.get('/private/get_my_company_addresses/1',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)
        self.assertEqual(len(response.json), 1)
        self.assertEqual(response.json[0]["id"], 1)

    @BaseCase.login
    def test_ko_not_assigned(self, token):
        self.db.insert({"id": 2, "email": "myemail@test.lu", "password": "MyWrongSecretSecret"}, self.db.tables["User"])

        self.db.insert({"id": 1, "name": "My Company 1"}, self.db.tables["Company"])

        self.db.insert({"user_id": 2, "company_id": 1}, self.db.tables["UserCompanyAssignment"])

        self.db.insert({
            "id": 1,
            "company_id": 1,
            "address_1": "Rue inconnue",
            "address_2": None,
            "number": None,
            "postal_code": "1515",
            "city": "Luxembourg",
            "administrative_area": None,
            "country": "Luxembourg",
            "latitude": None,
            "longitude": None,
        }, self.db.tables["CompanyAddress"])

        response = self.application.get('/private/get_my_company_addresses/1',
                                        headers=self.get_standard_header(token))

        self.assertEqual("422 Object not found or you don't have the required access to it", response.status)
