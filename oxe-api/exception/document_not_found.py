
class DocumentNotFound(Exception):

    def __init__(self):
        super().__init__("422 Document not found")
