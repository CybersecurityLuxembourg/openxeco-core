
class WrongProperty(Exception):

    def __init__(self):
        super().__init__("422 The property is wrong")
