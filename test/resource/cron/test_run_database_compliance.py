from test.BaseCase import BaseCase


class TestRunDatabaseCompliance(BaseCase):

    @BaseCase.login
    @BaseCase.grant_access("/cron/run_database_compliance")
    def test_ok_company_without_data(self, token):
        self.db.insert({"id": 1, "name": "Company"}, self.db.tables["Company"])

        response = self.application.post('/cron/run_database_compliance',
                                         headers=self.get_standard_post_header(token))

        data_controls = self.db.get(self.db.tables["DataControl"])

        self.assertEqual(200, response.status_code)
        self.assertEqual(data_controls[0].category, 'DATABASE COMPLIANCE')
        self.assertEqual(data_controls[0].value, "Value 'image' of <COMPANY:1> is empty")
        self.assertEqual(data_controls[1].category, 'DATABASE COMPLIANCE')
        self.assertEqual(data_controls[1].value, "Value 'description' of <COMPANY:1> is empty")
        self.assertEqual(data_controls[2].category, 'DATABASE COMPLIANCE')
        self.assertEqual(data_controls[2].value, "Value 'creation_date' of <COMPANY:1> is empty")
        self.assertEqual(data_controls[3].category, 'DATABASE COMPLIANCE')
        self.assertEqual(data_controls[3].value, "Value 'website' of <COMPANY:1> is empty")
        self.assertEqual(data_controls[4].category, 'DATABASE COMPLIANCE')
        self.assertEqual(data_controls[4].value, '<COMPANY:1> has no address registered')
        self.assertEqual(data_controls[5].category, 'DATABASE COMPLIANCE')
        self.assertEqual(data_controls[5].value, '<COMPANY:1> has no phone number registered as a contact')
        self.assertEqual(data_controls[6].category, 'DATABASE COMPLIANCE')
        self.assertEqual(data_controls[6].value, '<COMPANY:1> has no email address registered  as a contact')

    @BaseCase.login
    @BaseCase.grant_access("/cron/run_database_compliance")
    def test_ok_company_with_all_contact_and_address_data(self, token):
        self.db.insert({"id": 11, "thumbnail": bytes("", 'utf8'), "width": 12, "height": 12,
                        "creation_date": "2020-01-01"}, self.db.tables["Image"])
        self.db.insert({"id": 1, "name": "Company", "website": "", "image": 11,
                        "creation_date": "2020-01-01", "description": "desc"}, self.db.tables["Company"])
        self.db.insert({"id": 21, "company_id": 1, "type": "EMAIL ADDRESS", "representative": "ENTITY",
                        "value": "mail@example.com"}, self.db.tables["CompanyContact"])
        self.db.insert({"id": 22, "company_id": 1, "type": "PHONE NUMBER", "representative": "ENTITY",
                        "value": "045065561"}, self.db.tables["CompanyContact"])
        self.db.insert({"id": 31, "company_id": 1, "address_1": "", "city": "",
                        "country": "", "latitude": 1, "longitude": 1}, self.db.tables["Company_Address"])

        response = self.application.post('/cron/run_database_compliance',
                                         headers=self.get_standard_post_header(token))

        data_controls = self.db.get(self.db.tables["DataControl"])

        self.assertEqual(200, response.status_code)
        self.assertEqual(len(data_controls), 0)

    @BaseCase.login
    @BaseCase.grant_access("/cron/run_database_compliance")
    def test_ok_company_as_actor_with_complete_taxonomy(self, token):
        self.db.insert({"id": 11, "thumbnail": bytes("", 'utf8'), "width": 12, "height": 12,
                        "creation_date": "2020-01-01"}, self.db.tables["Image"])
        self.db.insert({"id": 1, "name": "Company", "website": "", "image": 11,
                        "creation_date": "2020-01-01", "description": "desc"}, self.db.tables["Company"])
        self.db.insert({"id": 21, "company_id": 1, "type": "EMAIL ADDRESS", "representative": "ENTITY",
                        "value": "mail@example.com"}, self.db.tables["CompanyContact"])
        self.db.insert({"id": 22, "company_id": 1, "type": "PHONE NUMBER", "representative": "ENTITY",
                        "value": "045065561"}, self.db.tables["CompanyContact"])
        self.db.insert({"id": 31, "company_id": 1, "address_1": "", "city": "",
                        "country": "", "latitude": 1, "longitude": 1}, self.db.tables["Company_Address"])

        self.db.insert({"name": "ECOSYSTEM ROLE"}, self.db.tables["TaxonomyCategory"])
        self.db.insert({"name": "SERVICE GROUP"}, self.db.tables["TaxonomyCategory"])
        self.db.insert({"name": "ENTITY TYPE"}, self.db.tables["TaxonomyCategory"])
        self.db.insert({"id": 1, "name": "ACTOR", "category": "ECOSYSTEM ROLE"}, self.db.tables["TaxonomyValue"])
        self.db.insert({"id": 2, "name": "EX. SERVICE", "category": "SERVICE GROUP"}, self.db.tables["TaxonomyValue"])
        self.db.insert({"id": 3, "name": "PRIVATE SECTOR", "category": "ENTITY TYPE"}, self.db.tables["TaxonomyValue"])
        self.db.insert({"company": 1, "taxonomy_value": 1}, self.db.tables["TaxonomyAssignment"])
        self.db.insert({"company": 1, "taxonomy_value": 2}, self.db.tables["TaxonomyAssignment"])
        self.db.insert({"company": 1, "taxonomy_value": 3}, self.db.tables["TaxonomyAssignment"])

        response = self.application.post('/cron/run_database_compliance',
                                         headers=self.get_standard_post_header(token))

        data_controls = self.db.get(self.db.tables["DataControl"])

        self.assertEqual(200, response.status_code)
        self.assertEqual(len(data_controls), 0)

    @BaseCase.login
    @BaseCase.grant_access("/cron/run_database_compliance")
    def test_ok_company_as_actor_without_complete_taxonomy(self, token):
        self.db.insert({"id": 11, "thumbnail": bytes("", 'utf8'), "width": 12, "height": 12,
                        "creation_date": "2020-01-01"}, self.db.tables["Image"])
        self.db.insert({"id": 1, "name": "Company", "website": "", "image": 11,
                        "creation_date": "2020-01-01", "description": "desc"}, self.db.tables["Company"])
        self.db.insert({"id": 21, "company_id": 1, "type": "EMAIL ADDRESS", "representative": "ENTITY",
                        "value": "mail@example.com"}, self.db.tables["CompanyContact"])
        self.db.insert({"id": 22, "company_id": 1, "type": "PHONE NUMBER", "representative": "ENTITY",
                        "value": "045065561"}, self.db.tables["CompanyContact"])
        self.db.insert({"id": 31, "company_id": 1, "address_1": "", "city": "",
                        "country": "", "latitude": 1, "longitude": 1}, self.db.tables["Company_Address"])

        self.db.insert({"name": "ECOSYSTEM ROLE"}, self.db.tables["TaxonomyCategory"])
        self.db.insert({"name": "SERVICE GROUP"}, self.db.tables["TaxonomyCategory"])
        self.db.insert({"name": "ENTITY TYPE"}, self.db.tables["TaxonomyCategory"])
        self.db.insert({"id": 1, "name": "ACTOR", "category": "ECOSYSTEM ROLE"}, self.db.tables["TaxonomyValue"])
        self.db.insert({"id": 2, "name": "EX. SERVICE", "category": "SERVICE GROUP"}, self.db.tables["TaxonomyValue"])
        self.db.insert({"id": 3, "name": "PRIVATE SECTOR", "category": "ENTITY TYPE"}, self.db.tables["TaxonomyValue"])
        self.db.insert({"company": 1, "taxonomy_value": 1}, self.db.tables["TaxonomyAssignment"])

        response = self.application.post('/cron/run_database_compliance',
                                         headers=self.get_standard_post_header(token))

        data_controls = self.db.get(self.db.tables["DataControl"])

        self.assertEqual(200, response.status_code)
        self.assertEqual(len(data_controls), 2)
        self.assertEqual(data_controls[0].category, 'DATABASE COMPLIANCE')
        self.assertEqual(data_controls[0].value, "<COMPANY:1> has no value for taxonomy 'ENTITY TYPE'")
        self.assertEqual(data_controls[1].category, 'DATABASE COMPLIANCE')
        self.assertEqual(data_controls[1].value, "<COMPANY:1> has no value for taxonomy 'SERVICE GROUP'")

    @BaseCase.login
    @BaseCase.grant_access("/cron/run_database_compliance")
    def test_ok_news_with_no_data(self, token):
        self.db.insert({"id": 1, "title": "My article", "type": "NEWS"}, self.db.tables["Article"])

        response = self.application.post('/cron/run_database_compliance',
                                         headers=self.get_standard_post_header(token))

        data_controls = self.db.get(self.db.tables["DataControl"])

        self.assertEqual(200, response.status_code)
        self.assertEqual(len(data_controls), 2)
        self.assertEqual(data_controls[0].category, 'DATABASE COMPLIANCE')
        self.assertEqual(data_controls[0].value, "Value 'Article.handle' of article <ARTICLE:1> is empty")
        self.assertEqual(data_controls[1].category, 'DATABASE COMPLIANCE')
        self.assertEqual(data_controls[1].value, "<ARTICLE:1> has no main version and no link")

    @BaseCase.login
    @BaseCase.grant_access("/cron/run_database_compliance")
    def test_ok_news_with_empty_main_version(self, token):
        self.db.insert({"id": 1, "title": "My article", "type": "NEWS", "handle": "my_article",
                        "publication_date": "2020-01-01"}, self.db.tables["Article"])
        self.db.insert({"id": 1, "article_id": 1, "name": "Version 0", "is_main": 1}, self.db.tables["ArticleVersion"])

        response = self.application.post('/cron/run_database_compliance',
                                         headers=self.get_standard_post_header(token))

        data_controls = self.db.get(self.db.tables["DataControl"])

        self.assertEqual(200, response.status_code)
        self.assertEqual(len(data_controls), 1)
        self.assertEqual(data_controls[0].category, 'DATABASE COMPLIANCE')
        self.assertEqual(data_controls[0].value, "<ARTICLE:1> has an empty main version and no link")

    @BaseCase.login
    @BaseCase.grant_access("/cron/run_database_compliance")
    def test_ok_news_with_all_data(self, token):
        self.db.insert({"id": 1, "title": "My article", "type": "NEWS", "handle": "my_article",
                        "publication_date": "2020-01-01"}, self.db.tables["Article"])
        self.db.insert({"id": 1, "article_id": 1, "name": "Version 0", "is_main": 1}, self.db.tables["ArticleVersion"])
        self.db.insert({"id": 1, "article_version_id": 1, "position": 1, "type": "TITLE1", "content": "title 1"},
                       self.db.tables["ArticleBox"])

        response = self.application.post('/cron/run_database_compliance',
                                         headers=self.get_standard_post_header(token))

        data_controls = self.db.get(self.db.tables["DataControl"])

        self.assertEqual(200, response.status_code)
        self.assertEqual(len(data_controls), 0)
