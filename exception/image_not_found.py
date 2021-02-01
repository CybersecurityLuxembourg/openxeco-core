
class ImageNotFound(Exception):

    def __init__(self):
        super().__init__("Image not found")
