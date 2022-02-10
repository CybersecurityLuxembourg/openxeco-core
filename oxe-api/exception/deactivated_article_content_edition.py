
class DeactivatedArticleContentEdition(Exception):

    def __init__(self):
        super().__init__("403 The article content edition is deactivated")
