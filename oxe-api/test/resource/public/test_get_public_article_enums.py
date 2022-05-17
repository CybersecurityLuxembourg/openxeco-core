from test.BaseCase import BaseCase


class TestGetPublicArticleEnums(BaseCase):

    def test_ok(self):

        response = self.application.get('/public/get_public_article_enums')

        self.assertEqual(200, response.status_code)
        self.assertEqual({
            'status': ['DRAFT', 'UNDER REVIEW', 'PUBLIC', 'ARCHIVE'],
            'type': ['NEWS', 'EVENT', 'TOOL', 'SERVICE', 'RESOURCE', 'JOB OFFER']
        }, response.json)
