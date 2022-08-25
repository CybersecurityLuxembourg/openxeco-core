
class UserNotAssignedToEntity(Exception):

    def __init__(self):
        super().__init__("422 The user is not assign to the entity")
