
class ObjectAlreadyExisting(Exception):

    def __init__(self):
        super().__init__("Object already existing")
