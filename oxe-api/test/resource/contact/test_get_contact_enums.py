from test.BaseCase import BaseCase


class TestGetContactEnums(BaseCase):

    @BaseCase.login
    def test_ok(self, token):
        response = self.application.get('/contact/get_contact_enums', headers=self.get_standard_header(token))

        self.assertEqual(response.json, {
            "type": ['EMAIL ADDRESS', 'PHONE NUMBER'],
            "representative": ['ENTITY', 'PHYSICAL PERSON'],
            "department": ['TOP MANAGEMENT', 'HUMAN RESOURCE', 'MARKETING', 'FINANCE', 'OPERATION/PRODUCTION',
                           'INFORMATION TECHNOLOGY', 'OTHER']
        })
        self.assertEqual(200, response.status_code)
