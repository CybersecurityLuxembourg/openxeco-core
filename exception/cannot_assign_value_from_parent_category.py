
class CannotAssignValueFromParentCategory(Exception):

    def __init__(self):
        super().__init__("422 Cannot assign value from parent category")
