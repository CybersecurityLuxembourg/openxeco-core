from test.BaseCase import BaseCase


class TestRunDatabaseCompliance(BaseCase):



    @BaseCase.login
    @BaseCase.grant_access("/cron/run_database_compliance")
    def test_ok_company_without_data(self, token):
        s = self.db.tables["Setting"]
        self.db.insert({"id": 1, "name": "Company"}, self.db.tables["Company"])
        self.db.insert({"property": "HIGHLIGHT_ENTITIES_WITHOUT_CREATION_DATE", "value": "TRUE"}, s)
        self.db.insert({"property": "HIGHLIGHT_ENTITIES_WITHOUT_WEBSITE", "value": "TRUE"}, s)
        self.db.insert({"property": "HIGHLIGHT_ENTITIES_WITHOUT_IMAGE", "value": "TRUE"}, s)
        self.db.insert({"property": "HIGHLIGHT_ENTITIES_WITHOUT_POSTAL_ADDRESS", "value": "TRUE"}, s)
        self.db.insert({"property": "HIGHLIGHT_ENTITIES_WITH_POSTAL_ADDRESS_MISSING_GEOLOCATION", "value": "TRUE"}, s)
        self.db.insert({"property": "HIGHLIGHT_ENTITIES_WITHOUT_PHONE_NUMBER", "value": "TRUE"}, s)
        self.db.insert({"property": "HIGHLIGHT_ENTITIES_WITHOUT_EMAIL_ADDRESS", "value": "TRUE"}, s)

        response = self.application.post('/cron/run_database_compliance',
                                         headers=self.get_standard_post_header(token))

        data_controls = self.db.get(self.db.tables["DataControl"])

        self.assertEqual(200, response.status_code)
        self.assertEqual(data_controls[0].category, 'DATABASE COMPLIANCE')
        self.assertEqual(data_controls[0].value, "Value 'creation_date' of <COMPANY:1> is empty")
        self.assertEqual(data_controls[1].category, 'DATABASE COMPLIANCE')
        self.assertEqual(data_controls[1].value, "Value 'website' of <COMPANY:1> is empty")
        self.assertEqual(data_controls[2].category, 'DATABASE COMPLIANCE')
        self.assertEqual(data_controls[2].value, "Value 'image' of <COMPANY:1> is empty")
        self.assertEqual(data_controls[3].category, 'DATABASE COMPLIANCE')
        self.assertEqual(data_controls[3].value, '<COMPANY:1> has no address registered')
        self.assertEqual(data_controls[4].category, 'DATABASE COMPLIANCE')
        self.assertEqual(data_controls[4].value, '<COMPANY:1> has no phone number registered as a contact')
        self.assertEqual(data_controls[5].category, 'DATABASE COMPLIANCE')
        self.assertEqual(data_controls[5].value, '<COMPANY:1> has no email address registered  as a contact')

    @BaseCase.login
    @BaseCase.grant_access("/cron/run_database_compliance")
    def test_ok_company_with_all_contact_and_address_data(self, token):
        s = self.db.tables["Setting"]
        self.db.insert({"property": "HIGHLIGHT_ENTITIES_WITHOUT_CREATION_DATE", "value": "TRUE"}, s)
        self.db.insert({"property": "HIGHLIGHT_ENTITIES_WITHOUT_WEBSITE", "value": "TRUE"}, s)
        self.db.insert({"property": "HIGHLIGHT_ENTITIES_WITHOUT_IMAGE", "value": "TRUE"}, s)
        self.db.insert({"property": "HIGHLIGHT_ENTITIES_WITHOUT_POSTAL_ADDRESS", "value": "TRUE"}, s)
        self.db.insert({"property": "HIGHLIGHT_ENTITIES_WITH_POSTAL_ADDRESS_MISSING_GEOLOCATION", "value": "TRUE"}, s)
        self.db.insert({"property": "HIGHLIGHT_ENTITIES_WITHOUT_PHONE_NUMBER", "value": "TRUE"}, s)
        self.db.insert({"property": "HIGHLIGHT_ENTITIES_WITHOUT_EMAIL_ADDRESS", "value": "TRUE"}, s)

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
    def test_ok_news_with_no_data(self, token):
        s = self.db.tables["Setting"]
        self.db.insert({"property": "HIGHLIGHT_ARTICLE_WITHOUT_TITLE", "value": "TRUE"}, s)
        self.db.insert({"property": "HIGHLIGHT_ARTICLE_WITHOUT_HANDLE", "value": "TRUE"}, s)
        self.db.insert({"property": "HIGHLIGHT_ARTICLE_WITHOUT_PUBLICATION_DATE", "value": "TRUE"}, s)
        self.db.insert({"property": "HIGHLIGHT_ARTICLE_WITHOUT_START_DATE", "value": "TRUE"}, s)
        self.db.insert({"property": "HIGHLIGHT_ARTICLE_WITHOUT_END_DATE", "value": "TRUE"}, s)
        self.db.insert({"property": "HIGHLIGHT_ARTICLE_WITHOUT_CONTENT", "value": "TRUE"}, s)

        self.db.insert({"id": 1, "title": "My article", "type": "NEWS"}, self.db.tables["Article"])

        response = self.application.post('/cron/run_database_compliance',
                                         headers=self.get_standard_post_header(token))

        data_controls = self.db.get(self.db.tables["DataControl"])

        self.assertEqual(200, response.status_code)
        self.assertEqual(len(data_controls), 2)
        self.assertEqual(data_controls[0].category, 'DATABASE COMPLIANCE')
        self.assertEqual(data_controls[0].value, "Value 'handle' of article <ARTICLE:1> is empty")
        self.assertEqual(data_controls[1].category, 'DATABASE COMPLIANCE')
        self.assertEqual(data_controls[1].value, "<ARTICLE:1> has no main version and no link")

    @BaseCase.login
    @BaseCase.grant_access("/cron/run_database_compliance")
    def test_ok_news_with_empty_main_version(self, token):
        s = self.db.tables["Setting"]
        self.db.insert({"property": "HIGHLIGHT_ARTICLE_WITHOUT_TITLE", "value": "TRUE"}, s)
        self.db.insert({"property": "HIGHLIGHT_ARTICLE_WITHOUT_HANDLE", "value": "TRUE"}, s)
        self.db.insert({"property": "HIGHLIGHT_ARTICLE_WITHOUT_PUBLICATION_DATE", "value": "TRUE"}, s)
        self.db.insert({"property": "HIGHLIGHT_ARTICLE_WITHOUT_START_DATE", "value": "TRUE"}, s)
        self.db.insert({"property": "HIGHLIGHT_ARTICLE_WITHOUT_END_DATE", "value": "TRUE"}, s)
        self.db.insert({"property": "HIGHLIGHT_ARTICLE_WITHOUT_CONTENT", "value": "TRUE"}, s)

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
        s = self.db.tables["Setting"]
        self.db.insert({"property": "HIGHLIGHT_ARTICLE_WITHOUT_TITLE", "value": "TRUE"}, s)
        self.db.insert({"property": "HIGHLIGHT_ARTICLE_WITHOUT_HANDLE", "value": "TRUE"}, s)
        self.db.insert({"property": "HIGHLIGHT_ARTICLE_WITHOUT_PUBLICATION_DATE", "value": "TRUE"}, s)
        self.db.insert({"property": "HIGHLIGHT_ARTICLE_WITHOUT_START_DATE", "value": "TRUE"}, s)
        self.db.insert({"property": "HIGHLIGHT_ARTICLE_WITHOUT_END_DATE", "value": "TRUE"}, s)
        self.db.insert({"property": "HIGHLIGHT_ARTICLE_WITHOUT_CONTENT", "value": "TRUE"}, s)

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
