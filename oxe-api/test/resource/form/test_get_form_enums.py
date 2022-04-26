from test.BaseCase import BaseCase


class TestGetFormEnums(BaseCase):

    @BaseCase.login
    def test_ok(self, token):

        response = self.application.get('/form/get_form_enums',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)
        self.assertEqual({
            'status': ['ACTIVE', 'INACTIVE', 'DELETED'],
        }, response.json)
