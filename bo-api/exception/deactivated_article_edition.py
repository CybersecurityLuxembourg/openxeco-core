
class DeactivatedArticleEdition(Exception):

    def __init__(self):
        super().__init__("403 The article edition is deactivated")
