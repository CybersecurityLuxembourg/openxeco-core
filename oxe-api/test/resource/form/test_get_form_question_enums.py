from test.BaseCase import BaseCase


class TestGetFormQuestionEnums(BaseCase):

    @BaseCase.login
    def test_ok(self, token):

        response = self.application.get('/form/get_form_question_enums',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)
        self.assertEqual({
            'status': ['ACTIVE', 'INACTIVE', 'DELETED'],
            'type': ['TEXT', 'CHECKBOX', 'OPTIONS', 'SELECT']
        }, response.json)
