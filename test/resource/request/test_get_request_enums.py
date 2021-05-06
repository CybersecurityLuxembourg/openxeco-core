from test.BaseCase import BaseCase


class TestGetRequestEnums(BaseCase):

    @BaseCase.login
    def test_ok(self, token):

        response = self.application.get('/request/get_request_enums',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)
        self.assertEqual(response.get_json(), {
            'status': ['NEW', 'IN PROCESS', 'PROCESSED', 'REJECTED'],
            'type': [
                'ENTITY ADD',
                'ENTITY CHANGE',
                'ENTITY ACCESS CLAIM',
                'ENTITY ADDRESS CHANGE',
                'ENTITY ADDRESS ADD',
                'ENTITY ADDRESS DELETION',
                'ENTITY TAXONOMY CHANGE',
                'ENTITY LOGO CHANGE'
            ]
        })

