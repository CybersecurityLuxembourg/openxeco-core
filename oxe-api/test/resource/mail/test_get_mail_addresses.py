from test.BaseCase import BaseCase


class TestGetMailAddresses(BaseCase):

    @BaseCase.login
    def test_ok_without_filter(self, token):
        self.db.insert({"id": 2, "name": "My Company"}, self.db.tables["Company"])
        self.db.insert({
            "id": 1,
            "company_id": 2,
            "type": "EMAIL ADDRESS",
            "representative": "ENTITY",
            "name": None,
            "value": "company@contact.com",
        }, self.db.tables["CompanyContact"])

        response = self.application.get('/mail/get_mail_addresses',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)
        self.assertEqual([
            {
                'email': "company@contact.com",
                'information': None,
                'source': 'CONTACT OF COMPANY'
            },
            {
                'email': 'test@openxeco.org',
                'information': None,
                'source': 'USER'
            }
        ], response.json)

    @BaseCase.login
    def test_ok_without_contact(self, token):
        self.db.insert({"id": 2, "name": "My Company"}, self.db.tables["Company"])
        self.db.insert({
            "id": 1,
            "company_id": 2,
            "type": "EMAIL ADDRESS",
            "representative": "ENTITY",
            "name": None,
            "value": "company@contact.com",
        }, self.db.tables["CompanyContact"])

        response = self.application.get('/mail/get_mail_addresses?include_contacts=false',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)
        self.assertEqual([
            {
                'email': 'test@openxeco.org',
                'information': None,
                'source': 'USER'
            }
        ], response.json)

    @BaseCase.login
    def test_ok_without_users(self, token):
        self.db.insert({"id": 2, "name": "My Company"}, self.db.tables["Company"])
        self.db.insert({
            "id": 1,
            "company_id": 2,
            "type": "EMAIL ADDRESS",
            "representative": "ENTITY",
            "name": None,
            "value": "company@contact.com",
        }, self.db.tables["CompanyContact"])

        response = self.application.get('/mail/get_mail_addresses?include_users=false',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)
        self.assertEqual([
            {
                'email': "company@contact.com",
                'information': None,
                'source': 'CONTACT OF COMPANY'
            }
        ], response.json)

    @BaseCase.login
    def test_ok_with_company_filter(self, token):
        self.db.insert({"id": 2, "name": "My Company"}, self.db.tables["Company"])
        self.db.insert({"id": 3, "name": "My Company 2"}, self.db.tables["Company"])
        self.db.insert({
            "id": 1,
            "company_id": 2,
            "type": "EMAIL ADDRESS",
            "representative": "ENTITY",
            "name": None,
            "value": "company@contact.com",
        }, self.db.tables["CompanyContact"])
        self.db.insert({
            "id": 2,
            "company_id": 3,
            "type": "EMAIL ADDRESS",
            "representative": "ENTITY",
            "name": None,
            "value": "company2@contact.com",
        }, self.db.tables["CompanyContact"])

        self.db.insert({"id": 2, "email": "email2@test.lu", "password": "", "is_active": True}, self.db.tables["User"])
        self.db.insert({"user_id": 2, "company_id": 2}, self.db.tables["UserCompanyAssignment"])
        self.db.insert({"id": 3, "email": "email3@test.lu", "password": "", "is_active": True}, self.db.tables["User"])
        self.db.insert({"user_id": 3, "company_id": 3}, self.db.tables["UserCompanyAssignment"])

        response = self.application.get('/mail/get_mail_addresses?companies=3',
                                        headers=self.get_standard_header(token))

        # The "test@cybersecurity.lu" shouldn't be in this list
        # The user with ID 2 shouldn't be in the list either

        self.assertEqual(200, response.status_code)
        self.assertEqual([
            {
                'email': "company2@contact.com",
                'information': None,
                'source': 'CONTACT OF COMPANY'
            },
            {
                'email': 'email3@test.lu',
                'information': None,
                'source': 'USER'
            }
        ], response.json)

    @BaseCase.login
    def test_ok_with_taxonomy_filter(self, token):
        self.db.insert({"id": 2, "name": "My Company"}, self.db.tables["Company"])
        self.db.insert({"id": 3, "name": "My Company 2"}, self.db.tables["Company"])
        self.db.insert({
            "id": 1,
            "company_id": 2,
            "type": "EMAIL ADDRESS",
            "representative": "ENTITY",
            "name": None,
            "value": "company@contact.com",
        }, self.db.tables["CompanyContact"])
        self.db.insert({
            "id": 2,
            "company_id": 3,
            "type": "EMAIL ADDRESS",
            "representative": "ENTITY",
            "name": None,
            "value": "company2@contact.com",
        }, self.db.tables["CompanyContact"])

        self.db.insert({"id": 2, "email": "email2@test.lu", "password": "", "is_active": True}, self.db.tables["User"])
        self.db.insert({"user_id": 2, "company_id": 2}, self.db.tables["UserCompanyAssignment"])
        self.db.insert({"id": 3, "email": "email3@test.lu", "password": "", "is_active": True}, self.db.tables["User"])
        self.db.insert({"user_id": 3, "company_id": 3}, self.db.tables["UserCompanyAssignment"])

        self.db.insert({"name": "CAT1"}, self.db.tables["TaxonomyCategory"])
        self.db.insert({"id": 1, "name": "My Value", "category": "CAT1"}, self.db.tables["TaxonomyValue"])
        self.db.insert({"id": 2, "name": "My Value2", "category": "CAT1"}, self.db.tables["TaxonomyValue"])
        self.db.insert({"company": 3, "taxonomy_value": 2}, self.db.tables["TaxonomyAssignment"])

        response = self.application.get('/mail/get_mail_addresses?taxonomies=2',
                                        headers=self.get_standard_header(token))

        # The "test@cybersecurity.lu" shouldn't be in this list
        # The user with ID 2 shouldn't be in the list either

        self.assertEqual(200, response.status_code)
        self.assertEqual([
            {
                'email': "company2@contact.com",
                'information': None,
                'source': 'CONTACT OF COMPANY'
            },
            {
                'email': 'email3@test.lu',
                'information': None,
                'source': 'USER'
            }
        ], response.json)

    @BaseCase.login
    def test_ok_with_taxonomy_filter_but_empty(self, token):
        self.db.insert({"id": 2, "name": "My Company"}, self.db.tables["Company"])
        self.db.insert({"id": 3, "name": "My Company 2"}, self.db.tables["Company"])
        self.db.insert({
            "id": 1,
            "company_id": 2,
            "type": "EMAIL ADDRESS",
            "representative": "ENTITY",
            "name": None,
            "value": "company@contact.com",
        }, self.db.tables["CompanyContact"])
        self.db.insert({
            "id": 2,
            "company_id": 3,
            "type": "EMAIL ADDRESS",
            "representative": "ENTITY",
            "name": None,
            "value": "company2@contact.com",
        }, self.db.tables["CompanyContact"])

        self.db.insert({"id": 2, "email": "email2@test.lu", "password": "", "is_active": True}, self.db.tables["User"])
        self.db.insert({"user_id": 2, "company_id": 2}, self.db.tables["UserCompanyAssignment"])
        self.db.insert({"id": 3, "email": "email3@test.lu", "password": "", "is_active": True}, self.db.tables["User"])
        self.db.insert({"user_id": 3, "company_id": 3}, self.db.tables["UserCompanyAssignment"])

        self.db.insert({"name": "CAT1"}, self.db.tables["TaxonomyCategory"])
        self.db.insert({"id": 1, "name": "My Value", "category": "CAT1"}, self.db.tables["TaxonomyValue"])
        self.db.insert({"id": 2, "name": "My Value2", "category": "CAT1"}, self.db.tables["TaxonomyValue"])
        self.db.insert({"company": 3, "taxonomy_value": 2}, self.db.tables["TaxonomyAssignment"])

        response = self.application.get('/mail/get_mail_addresses?taxonomies=1',
                                        headers=self.get_standard_header(token))

        # The "test@cybersecurity.lu" shouldn't be in this list
        # The user with ID 2 shouldn't be in the list either

        self.assertEqual(200, response.status_code)
        self.assertEqual([], response.json)
