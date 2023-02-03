from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_jwt_extended import fresh_jwt_required, get_jwt_identity
from flask_restful import Resource
from webargs import fields

from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access
from exception.object_not_found import ObjectNotFound


class DeleteNote(MethodResource, Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @doc(tags=['note'],
         description='Delete a note',
         responses={
             "200": {},
             "422.a": {"description": "Object not found"},
             "422.b": {"description": "Your user is not the owner of the note"},
         })
    @use_kwargs({
        'id': fields.Int(),
    })
    @fresh_jwt_required
    @verify_admin_access
    @catch_exception
    def post(self, **kwargs):

        note = self.db.get(self.db.tables["Note"], {"id": kwargs["id"]})

        if len(note) > 0:
            if note[0].admin != int(get_jwt_identity()):
                return "", "422 Your user is not the owner of the note"
            self.db.delete_by_id(kwargs['id'], self.db.tables["Note"])
        else:
            raise ObjectNotFound

        return "", "200 "