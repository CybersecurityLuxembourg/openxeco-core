
class ArticleTypeNotAllowed(Exception):

    def __init__(self):
        super().__init__("403 The article type is not allowed")
