
class ObjectAlreadyExisting(Exception):

    def __init__(self):
        super().__init__("422 Object already existing")
