from test.BaseCase import BaseCase
import os
import base64


class TestAddRequest(BaseCase):

    @BaseCase.login
    def test_ok(self, token):

        payload = {
            "request": "My request",
            "type": "COMPANY CHANGE",
            "data": {'type': None}
        }

        response = self.application.post('/privatespace/add_request',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        requests = self.db.get(self.db.tables["UserRequest"])

        self.assertEqual(200, response.status_code)
        self.assertEqual(len(requests), 1)
        self.assertNotEqual(requests[0].type, None)
        self.assertNotEqual(requests[0].data, None)

    @BaseCase.login
    def test_ok_with_jpg(self, token):

        path = os.path.join(os.path.dirname(os.path.realpath(__file__)), "test_add_request", "small.jpg")

        f = open(path, 'rb')
        data = base64.b64encode(f.read()).decode("utf-8")

        payload = {
            "request": "My request",
            "image": data,
        }

        f.close()

        response = self.application.post('/privatespace/add_request',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        requests = self.db.get(self.db.tables["UserRequest"])

        self.assertEqual(200, response.status_code)
        self.assertEqual(len(requests), 1)
        self.assertNotEqual(requests[0].image, None)

    @BaseCase.login
    def test_ok_with_png(self, token):

        path = os.path.join(os.path.dirname(os.path.realpath(__file__)), "test_add_request", "small.png")

        f = open(path, 'rb')
        data = base64.b64encode(f.read()).decode("utf-8")

        payload = {
            "request": "My request",
            "image": data,
        }

        f.close()

        response = self.application.post('/privatespace/add_request',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        requests = self.db.get(self.db.tables["UserRequest"])

        self.assertEqual(200, response.status_code)
        self.assertEqual(len(requests), 1)
        self.assertNotEqual(requests[0].image, None)

    @BaseCase.login
    def test_ko_with_too_big_image(self, token):

        path = os.path.join(os.path.dirname(os.path.realpath(__file__)), "test_add_request", "too-big.jpg")

        f = open(path, 'rb')
        data = base64.b64encode(f.read()).decode("utf-8")

        payload = {
            "request": "My request",
            "image": data,
        }

        f.close()

        response = self.application.post('/privatespace/add_request',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual("422 Image width and height can't be bigger than 500 pixels", response.status)

    @BaseCase.login
    def test_ko_fail_to_read_image(self, token):

        path = os.path.join(os.path.dirname(os.path.realpath(__file__)), "test_add_request", "not_an_image.txt")

        f = open(path, 'rb')
        data = base64.b64encode(f.read()).decode("utf-8")

        payload = {
            "request": "My request",
            "image": data,
        }

        f.close()

        response = self.application.post('/privatespace/add_request',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual("422 Impossible to read the image", response.status)
