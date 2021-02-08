import functools
import flask
import json
from flask_jwt_extended import get_jwt_identity


def log_request(function):
    @functools.wraps(function)
    def wrapper(self, *args, **kwargs):
        a = function(self, *args, **kwargs)

        params = None

        if flask.request.method == "POST" and flask.request.json is not None:
            params = flask.request.json

            if "password" in params:
                params["password"] = "[SERVER] ANONYMISED"

            if "image" in params:
                params["image"] = "[SERVER] NOT LOGGED"

            params = json.dumps(params)

        log = {
            "user_id": int(get_jwt_identity()) if get_jwt_identity() is not None else None,
            "request": flask.request.path,
            "request_method": flask.request.method,
            "params": params,
            "status_code": 200 if type(a) != tuple else int(str(a[1][0:3])),
            "status_description": "" if type(a) != tuple else a[1][4:][:150]
        }

        getattr(self, "db").insert(log, getattr(self, "db").tables["Log"])

        return a

    return wrapper
