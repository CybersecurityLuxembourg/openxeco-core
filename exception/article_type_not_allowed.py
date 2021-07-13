
class ArticleTypeNotAllowed(Exception):

    def __init__(self):
        super().__init__(f"403 The article type is not allowed")
