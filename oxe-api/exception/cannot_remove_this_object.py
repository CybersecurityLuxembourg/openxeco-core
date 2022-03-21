
class CannotRemoveThisObject(Exception):

    def __init__(self, msg):
        super().__init__(f"422 Cannot remove this object: {msg}")
