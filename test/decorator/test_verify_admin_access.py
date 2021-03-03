from test.BaseCase import BaseCase
from decorator.verify_payload import check_payload


class TestVerifyPayload(BaseCase):

    def test_check_payload_ok(self):
        res = check_payload(
            {
                'title': "My Title"
            },
            [
                {'field': 'title', 'type': str, 'optional': True}
            ]
        )

        self.assertEqual(res, [])
