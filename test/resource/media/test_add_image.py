from test.BaseCase import BaseCase
from unittest.mock import patch
import os
import base64


class TestAddImage(BaseCase):

    @BaseCase.login
    @patch('resource.media.add_image.IMAGE_FOLDER', os.path.join(os.path.dirname(os.path.realpath(__file__)), "test_add_image"))
    def test_ok(self, token):

        path = os.path.join(os.path.dirname(os.path.realpath(__file__)), "test_add_image", "original_image.png")
        target_path = os.path.join(os.path.dirname(os.path.realpath(__file__)), "test_add_image", "1")

        if os.path.exists(target_path):
            os.remove(target_path)

        f = open(path, 'rb')
        data = base64.b64encode(f.read()).decode("utf-8")

        payload = {"image": data}

        f.close()

        response = self.application.post('/media/add_image',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        images = self.db.get(self.db.tables["Image"])

        self.assertEqual(200, response.status_code)
        self.assertEqual(len(images), 1)
        self.assertTrue(os.path.exists(target_path))
        os.remove(target_path)

    @BaseCase.login
    @patch('resource.media.add_image.IMAGE_FOLDER', "/unexisting/path")
    def test_ko_file_exception(self, token):

        path = os.path.join(os.path.dirname(os.path.realpath(__file__)), "test_add_image", "original_image.png")

        f = open(path, 'rb')
        data = base64.b64encode(f.read()).decode("utf-8")

        payload = {"image": data}

        response = self.application.post('/media/add_image',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        images = self.db.get(self.db.tables["Image"])

        self.assertEqual("500 An error occurred while saving the file", response.status)
        self.assertEqual(len(images), 0)
