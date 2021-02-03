from test.BaseCase import BaseCase


class TestGetPublicCompany(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        self.db.insert({"id": 2, "name": "My Company"}, self.db.tables["Company"])

        response = self.application.get('/public/get_public_company/2',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)
        self.assertEqual(response.json, {
            'id': 2,
            'name': 'My Company',
            'is_startup': 0,
            'is_cybersecurity_core_business': 0,
            'rscl_number': None,
            'creation_date': None,
            'description': None,
            'website': None
        })

    @BaseCase.login
    def test_unexisting_id(self, token):
        response = self.application.get('/public/get_public_company/4',
                                        headers=self.get_standard_header(token))

        self.assertEqual(500, response.status_code)
