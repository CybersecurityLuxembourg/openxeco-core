
class ImageNotFound(Exception):

    def __init__(self):
        super().__init__("422 Image not found")
