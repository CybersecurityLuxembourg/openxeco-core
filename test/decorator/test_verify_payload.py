from decorator.verify_payload import check_payload
from test.BaseCase import BaseCase


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

    def test_check_payload_ok_optional(self):
        res = check_payload(
            {
            },
            [
                {'field': 'title', 'type': str, 'optional': True}
            ]
        )

        self.assertEqual(res, [])

    def test_check_payload_missing_biased(self):

        res = check_payload(
            {},
            [
                {'field': 'title', 'type': str}
            ]
        )

        self.assertEqual(res, ['title'])

    def test_check_payload_nullable_biased(self):
        res = check_payload(
            {
                'title': None
            },
            [
                {'field': 'title', 'type': str, 'nullable': False}
            ]
        )

        self.assertEqual(res, ['title'])

    def test_check_payload_nullable_and_missing_biased(self):
        res = check_payload(
            {
            },
            [
                {'field': 'title', 'type': list, 'nullable': False}
            ]
        )

        self.assertEqual(res, ['title'])

