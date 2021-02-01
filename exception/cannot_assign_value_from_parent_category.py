
class CannotAssignValueFromParentCategory(Exception):

    def __init__(self):
        super().__init__("Cannot assign value from parent category")
