import os
from unittest.mock import patch

from test.BaseCase import BaseCase


class TestGetPublicImage(BaseCase):

    @patch('resource.public.get_public_image.IMAGE_FOLDER', os.path.join(os.path.dirname(os.path.realpath(__file__)),
                                                                         "test_get_public_image"))
    def test_ok(self):

        response = self.application.get('/public/get_public_image/50')

        self.assertEqual(200, response.status_code)

    @patch('resource.public.get_public_image.IMAGE_FOLDER', os.path.join(os.path.dirname(os.path.realpath(__file__)),
                                                                         "test_get_public_image"))
    def test_ok_logo(self):

        response = self.application.get('/public/get_public_image/logo.png')

        self.assertEqual(200, response.status_code)

    @patch('resource.public.get_public_image.IMAGE_FOLDER', os.path.join(os.path.dirname(os.path.realpath(__file__)),
                                                                         "test_get_public_image"))
    def test_ok_favicon(self):

        response = self.application.get('/public/get_public_image/favicon.ico')

        self.assertEqual(200, response.status_code)

    @patch('resource.public.get_public_image.IMAGE_FOLDER', os.path.join(os.path.dirname(os.path.realpath(__file__)),
                                                                         "test_get_public_image"))
    def test_ko_missing_file(self):

        response = self.application.get('/public/get_public_image/506')

        self.assertEqual("422 Image not found", response.status)

    @patch('resource.public.get_public_image.IMAGE_FOLDER', os.path.join(os.path.dirname(os.path.realpath(__file__)),
                                                                         "test_get_public_image"))
    def test_ko_wrong_format(self):

        response = self.application.get('/public/get_public_image/other.string')

        self.assertEqual("422 The provided parameter mush be digits or 'favicon.ico' or 'logo.png'", response.status)
