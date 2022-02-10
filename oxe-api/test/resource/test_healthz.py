from test.BaseCase import BaseCase


class TestIsAlive(BaseCase):

    def test_ok(self):

        response = self.application.get('/healthz')

        self.assertEqual(200, response.status_code)
