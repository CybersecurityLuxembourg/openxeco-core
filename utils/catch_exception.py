import functools
import traceback


def catch_exception(f):
    @functools.wraps(f)
    def wrapper(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except Exception as e:
            traceback.print_exc()
            return "", f"500 {str(e)}"

    return wrapper
