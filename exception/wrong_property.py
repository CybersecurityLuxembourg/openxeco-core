
class WrongProperty(Exception):

    def __init__(self):
        super().__init__("The property is wrong")
