from test.BaseCase import BaseCase


class TestGetArticleEnums(BaseCase):

    def test_ok(self):

        response = self.application.get('/public/get_article_enums')

        self.assertEqual(200, response.status_code)
        self.assertEqual({
            'status': ['DRAFT', 'PUBLIC', 'ARCHIVE'],
            'type': ['NEWS', 'EVENT', 'TOOL', 'SERVICE', 'RESOURCE', 'JOB OFFER']
        }, response.json)
