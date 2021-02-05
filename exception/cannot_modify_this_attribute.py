
class CannotModifyThisAttribute(Exception):

    def __init__(self, attribute):
        super().__init__(f"Cannot modify this attribute: {attribute}")
