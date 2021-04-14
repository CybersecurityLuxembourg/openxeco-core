
class ObjectNotFound(Exception):

    def __init__(self, params=None):
        super().__init__(f"422 Object not found{' : ' + params if params is not None else ''}")
