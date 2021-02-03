from test.BaseCase import BaseCase


class TestGetArticleEnums(BaseCase):

    @BaseCase.login
    def test_ok(self, token):

        response = self.application.get('/article/get_article_enums',
                                        headers=self.get_standard_header(token))

        self.assertEqual(200, response.status_code)
        self.assertEqual({
            'status': ['DRAFT', 'PUBLIC'],
            'media': ['ALL', 'CYBERLUX', 'SECURITYMADEIN.LU'],
            'type': ['NEWS', 'EVENT', 'TOOL', 'SERVICE', 'RESOURCE', 'JOB OFFER']
        }, response.json)
