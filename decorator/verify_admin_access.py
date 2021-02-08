import functools
import flask
from flask_jwt_extended import get_jwt_identity


def verify_admin_access(function):
    @functools.wraps(function)
    def wrapper(self, *args, **kwargs):

        # Checking the user

        users = getattr(self, "db").get(
            getattr(self, "db").tables["User"],
            {"id": int(get_jwt_identity()) if get_jwt_identity() is not None else None})

        if len(users) == 0:
            return "", f"401 The user has not been found"

        if users[0].is_admin == 0:
            return "", f"401 This user is not an admin"

        # Checking the user group

        groups = getattr(self, "db").get(
            getattr(self, "db").tables["UserGroupAssignment"],
            {"user_id": int(get_jwt_identity()) if get_jwt_identity() is not None else None})

        if len(groups) == 0:
            return "", f"401 This user is not affected to a user group"

        # Checking the right

        rights = getattr(self, "db").get(
            getattr(self, "db").tables["UserGroupRight"],
            {"group_id": groups[0].group_id, "resource": flask.request.path})

        if len(rights) == 0:
            return "", f"401 This user is affected to a group without access to this resource"
        else:
            return function(self, *args, **kwargs)

    return wrapper
