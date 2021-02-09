
class ObjectNotFound(Exception):

    def __init__(self, params=None):
        super().__init__(f"Object not found{' : ' + params if params is not None else ''}")
