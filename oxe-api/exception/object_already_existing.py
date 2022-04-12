
class ObjectAlreadyExisting(Exception):

    def __init__(self, params=None):
        super().__init__(f"422 Object already existing{' : ' + params if params is not None else ''}")
