import functools
import re
import traceback


def catch_exception(f):
    @functools.wraps(f)
    def wrapper(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except BaseException as e:
            traceback.print_exc()
            if re.fullmatch(r"^[0-9]{3}[ ].*", str(e)) is not None:
                return "", str(e)
            return "", "500 An error occurred on the server"

    return wrapper
