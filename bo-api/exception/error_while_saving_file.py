
class ErrorWhileSavingFile(Exception):

    def __init__(self):
        super().__init__("500 An error occurred while saving the file")
