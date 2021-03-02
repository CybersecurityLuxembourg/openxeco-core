from test.BaseCase import BaseCase
import datetime


class TestIsAlive(BaseCase):

    def test_ok(self):

        response = self.application.get('/public/is_alive')

        self.assertEqual(200, response.status_code)
