
class CannotModifyThisAttribute(Exception):

    def __init__(self, attribute):
        super().__init__(f"422 Cannot modify this attribute: {attribute}")
